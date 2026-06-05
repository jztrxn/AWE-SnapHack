# GameController 

GameController is a comprehensive Bluetooth HID game controller integration framework for Spectacles. It provides seamless connectivity with various Bluetooth game controllers, automatic device discovery, input mapping, and haptic feedback support. The framework abstracts the complexity of Bluetooth GATT connections and HID report parsing, allowing developers to easily integrate gamepad controls into their Spectacles experiences.

## Features

- **Automatic Controller Discovery**: Scans for and identifies compatible Bluetooth HID controllers
- **Multi-Controller Support**: Built-in support for Xbox and SteelSeries controllers with extensible architecture
- **Complete Button Mapping**: Access to all standard gamepad inputs (A/B/X/Y, bumpers, triggers, D-pad)
- **Analog Stick Support**: Normalized analog stick values with dead-zone handling
- **Haptic Feedback**: Rumble/vibration support for compatible controllers
- **Event-Driven Input**: Subscribe to button state changes with callback handlers
- **Singleton Pattern**: Easy global access to controller state from anywhere in your project
- **Auto-Reconnection**: Automatic reconnection handling when controllers disconnect

## Quick Start

Initialize and connect to a game controller:

```typescript
import { GameController } from "GameController.lspkg/GameController";

@component
export class GameInput extends BaseScriptComponent {
  private controller = GameController.getInstance();

  async onAwake() {
    // Start scanning for controllers
    await this.controller.scanForControllers();

    // Listen for A button presses
    this.controller.onButtonStateChanged('a', (pressed) => {
      if (pressed) {
        print("A button pressed!");
        this.jump();
      }
    });

    // Listen for analog stick movement
    this.controller.onButtonStateChanged('lx', (value) => {
      this.moveCharacter(value as number);
    });
  }
}
```

## Script Highlights

- **GameController.ts**: Core controller manager implementing the singleton pattern. Handles Bluetooth scanning with HID service filtering, GATT connection management, device identification using registered controller profiles, characteristic discovery for input and rumble, notification registration for input events, and button state change event distribution. Provides methods for scanning, rumble control, and button state subscription.

- **BaseController.ts**: Abstract base class defining the controller implementation interface. Provides common functionality for parsing raw HID input buffers into structured button states, tracking state changes for event triggering, normalizing analog values to -1.0 to 1.0 range, decoding 16-bit signed integers from HID reports, and managing rumble command generation. All controller-specific implementations extend this class.

- **ButtonState.ts**: TypeScript interface defining the complete button and axis state structure. Includes digital buttons (a, b, x, y, lb, rb, view, start, home, lclick, rclick), analog triggers (lt, rt with 0-1 range), analog sticks (lx, ly, rx, ry with -1 to 1 range), and D-pad directions (dUp, dDown, dLeft, dRight). Used throughout the framework for type-safe input access.

- **XboxController.ts**: Xbox controller implementation with complete HID report parsing. Handles the Xbox-specific report format including button bit mappings, analog stick decoding with proper byte ordering, trigger value normalization, D-pad button extraction, and rumble command generation. Identifies Xbox controllers via "Xbox" device name substring.

- **SteelSeriesController.ts**: SteelSeries controller implementation with HID report parsing specific to SteelSeries Stratus+ and similar models. Handles SteelSeries-specific report format, button mappings, and rumble commands. Extends BaseController with SteelSeries-specific parsing logic.

## Core API Methods

### Scanning and Connection

```typescript
// Scan for available Bluetooth HID game controllers
async scanForControllers(): Promise<void>

// Example usage
const controller = GameController.getInstance();
await controller.scanForControllers();
print("Controller connected!");
```

### Button Event Subscription

```typescript
// Subscribe to button state changes
onButtonStateChanged<K extends ButtonKey>(
  key: K,
  handler: (val: ButtonState[K]) => void
): () => void

// Digital button example
const unsubscribeA = controller.onButtonStateChanged('a', (pressed) => {
  if (pressed) {
    print("A button pressed");
  } else {
    print("A button released");
  }
});

// Analog stick example
const unsubscribeLeftX = controller.onButtonStateChanged('lx', (value) => {
  print(`Left stick X: ${value}`); // -1.0 to 1.0
});

// Trigger example
const unsubscribeRT = controller.onButtonStateChanged('rt', (value) => {
  print(`Right trigger: ${value}`); // 0.0 to 1.0
});

// Later, unsubscribe
unsubscribeA();
```

### Getting Current State

```typescript
// Get current complete button state
getButtonState(): ButtonState | null

// Example usage
const state = controller.getButtonState();
if (state) {
  print(`A: ${state.a}, B: ${state.b}`);
  print(`Left Stick: ${state.lx}, ${state.ly}`);
  print(`Right Trigger: ${state.rt}`);
}
```

### Haptic Feedback

```typescript
// Send rumble feedback to the controller
sendRumble(power: number, durationMs?: number): void

// Light rumble for 500ms
controller.sendRumble(100, 500);

// Strong rumble for 1 second (default)
controller.sendRumble(255);

// Medium rumble for 2 seconds
controller.sendRumble(150, 2000);
```

## Advanced Usage

### Complete Character Controller

Here's a complete example of a character controller using gamepad input:

```typescript
import { GameController } from "GameController.lspkg/GameController";
import type { ButtonState } from "GameController.lspkg/Scripts/ButtonState";

@component
export class CharacterController extends BaseScriptComponent {
  @input characterTransform: Transform;
  @input moveSpeed: number = 5.0;
  @input turnSpeed: number = 2.0;
  @input jumpForce: number = 10.0;

  private controller = GameController.getInstance();
  private velocity = vec3.zero();
  private isGrounded = true;

  async onAwake() {
    // Connect to controller
    print("Scanning for game controllers...");
    await this.controller.scanForControllers();
    print("Controller connected!");

    // Setup input handlers
    this.setupMovementControls();
    this.setupActionButtons();

    // Update loop
    this.createEvent("UpdateEvent").bind(() => this.onUpdate());
  }

  private setupMovementControls() {
    // Left stick movement
    let moveX = 0;
    let moveY = 0;

    this.controller.onButtonStateChanged('lx', (value) => {
      moveX = value as number;
    });

    this.controller.onButtonStateChanged('ly', (value) => {
      moveY = value as number;
    });

    // Right stick camera
    let lookX = 0;
    let lookY = 0;

    this.controller.onButtonStateChanged('rx', (value) => {
      lookX = value as number;
    });

    this.controller.onButtonStateChanged('ry', (value) => {
      lookY = value as number;
    });

    // Store for update loop
    this.getSceneObject()['moveInput'] = { x: moveX, y: moveY };
    this.getSceneObject()['lookInput'] = { x: lookX, y: lookY };
  }

  private setupActionButtons() {
    // Jump on A button
    this.controller.onButtonStateChanged('a', (pressed) => {
      if (pressed && this.isGrounded) {
        this.jump();
      }
    });

    // Sprint on B button
    this.controller.onButtonStateChanged('b', (pressed) => {
      this.isSprinting = pressed;
    });

    // Interact on X button
    this.controller.onButtonStateChanged('x', (pressed) => {
      if (pressed) {
        this.interact();
      }
    });

    // Special ability on right trigger
    this.controller.onButtonStateChanged('rt', (value) => {
      if (value > 0.5) {
        this.useSpecialAbility(value as number);
      }
    });
  }

  private onUpdate() {
    const deltaTime = getDeltaTime();
    const state = this.controller.getButtonState();

    if (!state) return;

    // Movement
    const speed = this.isSprinting ? this.moveSpeed * 2 : this.moveSpeed;
    const movement = new vec3(
      state.lx * speed * deltaTime,
      0,
      -state.ly * speed * deltaTime
    );

    this.characterTransform.setWorldPosition(
      this.characterTransform.getWorldPosition().add(movement)
    );

    // Camera rotation
    if (Math.abs(state.rx) > 0.1 || Math.abs(state.ry) > 0.1) {
      this.rotateCamera(state.rx, state.ry, deltaTime);
    }
  }

  private jump() {
    print("Character jumping!");
    this.velocity.y = this.jumpForce;
    this.isGrounded = false;

    // Haptic feedback for jump
    this.controller.sendRumble(50, 100);
  }

  private interact() {
    print("Interacting with object");
    this.controller.sendRumble(100, 200);
  }

  private useSpecialAbility(intensity: number) {
    print(`Using special ability: ${intensity}`);
    // Rumble intensity matches ability intensity
    this.controller.sendRumble(Math.floor(intensity * 255), 300);
  }

  private rotateCamera(x: number, y: number, deltaTime: number) {
    // Camera rotation logic here
  }

  private isSprinting = false;
}
```

### Input Deadzone Handling

```typescript
@component
export class DeadzoneInput extends BaseScriptComponent {
  @input deadzone: number = 0.15;

  private controller = GameController.getInstance();

  onAwake() {
    this.controller.onButtonStateChanged('lx', (rawValue) => {
      const value = this.applyDeadzone(rawValue as number);
      if (value !== 0) {
        print(`Movement: ${value}`);
      }
    });
  }

  private applyDeadzone(value: number): number {
    if (Math.abs(value) < this.deadzone) {
      return 0;
    }

    // Remap the value beyond the deadzone
    const sign = value > 0 ? 1 : -1;
    const remapped = (Math.abs(value) - this.deadzone) / (1 - this.deadzone);
    return sign * remapped;
  }
}
```

### Multi-Button Combos

```typescript
@component
export class ComboSystem extends BaseScriptComponent {
  private controller = GameController.getInstance();
  private buttonState = new Map<string, boolean>();

  onAwake() {
    // Track all button states
    ['a', 'b', 'x', 'y', 'lb', 'rb'].forEach(button => {
      this.controller.onButtonStateChanged(button, (pressed) => {
        this.buttonState.set(button, pressed as boolean);
        this.checkCombos();
      });
    });
  }

  private checkCombos() {
    // Check for specific button combinations
    if (this.buttonState.get('lb') && this.buttonState.get('rb') &&
        this.buttonState.get('a')) {
      print("Super combo activated!");
      this.controller.sendRumble(255, 500);
    }

    // D-pad combos
    const state = this.controller.getButtonState();
    if (state?.dUp && state?.dRight && this.buttonState.get('a')) {
      print("Special move!");
    }
  }
}
```

### Controller-Based UI Navigation

```typescript
import { GameController } from "GameController.lspkg/GameController";

@component
export class UINavigation extends BaseScriptComponent {
  @input menuItems: SceneObject[];

  private controller = GameController.getInstance();
  private selectedIndex = 0;
  private lastDpadTime = 0;
  private dpadDelay = 200; // ms between D-pad inputs

  onAwake() {
    // D-pad navigation
    this.controller.onButtonStateChanged('dUp', (pressed) => {
      if (pressed && Date.now() - this.lastDpadTime > this.dpadDelay) {
        this.navigateUp();
      }
    });

    this.controller.onButtonStateChanged('dDown', (pressed) => {
      if (pressed && Date.now() - this.lastDpadTime > this.dpadDelay) {
        this.navigateDown();
      }
    });

    // A button to select
    this.controller.onButtonStateChanged('a', (pressed) => {
      if (pressed) {
        this.selectCurrentItem();
        this.controller.sendRumble(80, 100);
      }
    });

    // B button to go back
    this.controller.onButtonStateChanged('b', (pressed) => {
      if (pressed) {
        this.goBack();
      }
    });
  }

  private navigateUp() {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    this.updateSelection();
    this.controller.sendRumble(30, 50);
    this.lastDpadTime = Date.now();
  }

  private navigateDown() {
    this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
    this.updateSelection();
    this.controller.sendRumble(30, 50);
    this.lastDpadTime = Date.now();
  }

  private updateSelection() {
    this.menuItems.forEach((item, index) => {
      item.enabled = (index === this.selectedIndex);
    });
  }

  private selectCurrentItem() {
    print(`Selected item ${this.selectedIndex}`);
  }

  private goBack() {
    print("Going back");
  }
}
```

## Button and Axis Reference

### Digital Buttons (boolean)
- `a`, `b`, `x`, `y` - Face buttons
- `lb`, `rb` - Left and right bumpers
- `dUp`, `dDown`, `dLeft`, `dRight` - D-pad directions
- `view`, `start` - View and start/menu buttons
- `home` - Home/guide button
- `lclick`, `rclick` - Analog stick clicks

### Analog Inputs (number)
- `lx`, `ly` - Left analog stick X and Y (-1.0 to 1.0)
- `rx`, `ry` - Right analog stick X and Y (-1.0 to 1.0)
- `lt`, `rt` - Left and right triggers (0.0 to 1.0)

## Supported Controllers

### Xbox Controllers
- Xbox Wireless Controller
- Xbox Elite Controller
- Xbox Adaptive Controller

### SteelSeries Controllers
- SteelSeries Stratus+
- SteelSeries Stratus Duo

### Adding Custom Controllers

Extend `BaseController` to add support for new controllers:

```typescript
import { BaseController } from "GameController.lspkg/Scripts/BaseController";
import type { ButtonState } from "GameController.lspkg/Scripts/ButtonState";

export class MyCustomController extends BaseController {
  getDeviceNameSubstring(): string {
    return "MyController"; // Substring to identify your controller
  }

  parseInput(buffer: Uint8Array): ButtonState {
    // Parse your controller's HID report format
    return {
      a: (buffer[0] & 0x01) !== 0,
      b: (buffer[0] & 0x02) !== 0,
      // ... map all buttons and axes
      lx: this.normalize(this.decode(buffer[1], buffer[2])),
      ly: this.normalize(this.decode(buffer[3], buffer[4])),
      // ... etc
    };
  }

  supportsRumble(): boolean {
    return true;
  }

  getRumbleBuffer(power: number, duration: number): Uint8Array {
    // Create rumble command buffer for your controller
    const buffer = new Uint8Array(8);
    buffer[0] = 0x03; // Report ID
    buffer[1] = power;
    // ... configure rumble command
    return buffer;
  }
}

// Register your controller
// Add to RegisteredControllers.ts
```

## Performance Considerations

- **Connection Time**: Initial controller scan takes 5-10 seconds
- **Input Latency**: Typical Bluetooth HID latency is 10-20ms
- **Battery Impact**: Continuous rumble significantly impacts controller battery life
- **Event Frequency**: Button state changes trigger immediately, no polling delay
- **Memory**: Minimal overhead, only stores current controller state

## Troubleshooting

### Controller Not Connecting
1. Ensure controller is in pairing mode
2. Check controller is fully charged
3. Verify Bluetooth permissions are enabled
4. Try forgetting and re-pairing the controller

### Delayed Input
- Bluetooth latency is normal (10-20ms)
- Ensure no other Bluetooth devices are interfering
- Move controller closer to Spectacles

### Rumble Not Working
- Verify controller supports rumble with `supportsRumble()`
- Check rumble characteristic was successfully discovered
- Some controllers require specific initialization

---

## Built with 👻 by the Spectacles team <!-- --> <!-- --> <!-- --> <!-- -->


