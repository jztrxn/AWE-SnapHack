# AuthKitExamples 

Complete working examples demonstrating OAuth2 authentication integration with real-world services using AuthKit. These examples show how to build production-ready authentication flows with UI components, API integration, and proper error handling for Spectacles applications.

## Features

- **Spotify Music Controller**: Full-featured music player with OAuth2 authentication, liked songs playback, and audio preview support
- **Spotify Controller Minimum**: Minimal OAuth2 integration example showing basic authentication flow and API calls
- **UI Controller**: Generic OAuth2 UI controller template that works with any OAuth2 provider
- **RectangleButton Integration**: Modern UI Kit button components for clean, interactive authentication interfaces
- **Logging Configuration**: Built-in debug logging controls for development and troubleshooting
- **Best Practices**: Demonstrates proper error handling, token management, and user feedback

## Quick Start

Add AuthKitExamples to your project and explore the complete OAuth2 integration examples:

```typescript
// Use the generic UI Controller as a template
import { UIController } from "AuthKitExamples.lspkg/UIController";

// Or explore the Spotify examples for real-world integration
import { SpotifyMusicController } from "AuthKitExamples.lspkg/SpotifyExample/SpotifymusicController";
```

Each example is fully functional and can be used as-is or customized for your specific OAuth2 provider and requirements.

## Script Highlights

### Spotify Music Controller (SpotifymusicController.ts)

A comprehensive Spotify integration example demonstrating advanced OAuth2 usage:

- **OAuth2 Authentication**: Complete Spotify OAuth2 flow with proper scope handling (`user-read-private`, `user-library-read`, `user-read-playback-state`, `user-modify-playback-state`)
- **API Integration**: Fetches liked songs, track details, and controls Spotify playback on connected devices
- **Audio Preview Playback**: Loads and plays 30-second audio previews using RemoteServiceModule and RemoteMediaModule
- **Multi-Service Fallback**: Searches Deezer and iTunes APIs when Spotify preview URLs are unavailable
- **Album Artwork**: Dynamically loads and displays album artwork from Spotify API
- **UI Kit Integration**: Uses RectangleButton components for all interactive controls (sign in/out, play, pause, stop, next, previous)
- **Error Handling**: Comprehensive error handling with user-friendly status messages
- **Logging**: Configurable debug logging via `enableLogging` and `enableLoggingLifecycle` flags

**Key Methods:**
- `onSignIn()`: Initiates Spotify OAuth2 authorization flow
- `loadLikedSongs()`: Fetches user's liked songs from Spotify API
- `playCurrentTrack()`: Plays track on Spotify device or loads audio preview
- `loadAlbumArtwork()`: Downloads and displays album artwork

**API Endpoints Used:**
- `/v1/me/tracks` - Fetch liked songs
- `/v1/tracks/{id}` - Get track details with preview URLs
- `/v1/me/player/play` - Control Spotify playback
- Deezer and iTunes search APIs for preview fallback

### Spotify Controller Minimum (SpotifyControllerMinimum.ts)

A minimal Spotify authentication example perfect for learning OAuth2 basics:

- **Simple OAuth2 Flow**: Clean implementation of authorization code flow with minimal boilerplate
- **API Testing**: Demonstrates making authenticated API calls to get user profile data
- **UI Integration**: Shows how to bind RectangleButton components to authentication actions
- **Status Management**: Updates UI text to reflect authentication state
- **Error Feedback**: Handles common OAuth2 errors with helpful user messages

**Perfect for:**
- Learning OAuth2 fundamentals
- Quick prototyping of OAuth2 integrations
- Template for new OAuth2 provider integrations

### UI Controller (UIController.ts)

A generic OAuth2 UI controller that works with any OAuth2 provider:

- **Provider-Agnostic**: Configurable for any OAuth2 service (Google, GitHub, Discord, etc.)
- **Flexible Configuration**: Supports both Authorization Code Flow and Implicit Flow
- **Complete OAuth2 Options**: Configure client ID, client secret, authorization URI, token URI, refresh URI, and scopes
- **API Testing**: Includes API test button to verify authentication and token validity
- **Clean Architecture**: Separates OAuth2 logic from UI concerns for easy customization

**Configuration Properties:**
- `clientId`, `clientSecret` - OAuth2 application credentials
- `authorizationUri`, `tokenUri`, `refreshUri` - Provider endpoints
- `authenticationType` - "code" or "implicit" flow selection
- `scope` - Space-separated OAuth2 scopes
- `apiUri`, `apiResponseKey` - Test API endpoint configuration

**Use Cases:**
- Template for new OAuth2 provider integrations
- Rapid prototyping of authenticated features
- Learning OAuth2 configuration options

## Usage Examples

### Spotify Music Controller Setup

1. **Get Spotify Credentials:**
   - Register your app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Set redirect URI to: `https://www.spectacles.com/deeplink/specslink/oauth2redirect/unsecure`
   - Copy your Client ID

2. **Configure in Lens Studio:**
   - Add SpotifymusicController script to a SceneObject
   - Set `clientId` to your Spotify Client ID
   - Connect RectangleButton components for all controls
   - Connect Text components for status, track info, and debug messages
   - Connect Image component for album artwork
   - Connect AudioComponent for preview playback

3. **Configure Logging (Optional):**
   - Enable `enableLogging` for API calls and playback events
   - Enable `enableLoggingLifecycle` for component lifecycle debugging

4. **Deploy and Test:**
   - OAuth2 only works on device (not in Lens Studio editor)
   - Deploy to Spectacles and test the full authentication and playback flow

### Using Generic UI Controller

1. **Configure Your OAuth2 Provider:**
```typescript
// In Lens Studio Inspector:
Client ID: "your-github-client-id"
Authorization URI: "https://github.com/login/oauth/authorize"
Token URI: "https://github.com/login/oauth/access_token"
Authentication Type: "code"
Scope: "read:user user:email"
API URI: "https://api.github.com/user"
API Response Key: "login"
```

2. **Connect UI Components:**
   - Assign RectangleButton components to `signInButton`, `signOutButton`, `apiButton`
   - Assign Text components to `statusText` and `titleText`

3. **Test Your Integration:**
   - Sign in button triggers OAuth2 authorization flow
   - API button tests authenticated requests
   - Sign out button clears stored tokens

### Customizing for Your Provider

Start with UIController or SpotifyControllerMinimum and customize:

```typescript
import { OAuth2 } from "AuthKit.lspkg/Core/OAuth2";
import { RectangleButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton";

@component
export class MyProviderController extends BaseScriptComponent {
  @input signInButton: RectangleButton;
  @input statusText: Text;

  private auth: OAuth2;

  onAwake() {
    // Configure for your OAuth2 provider
    this.auth = new OAuth2({
      clientId: "your-client-id",
      authorizationUri: "https://your-provider.com/oauth/authorize",
      tokenUri: "https://your-provider.com/oauth/token",
      authenticationType: "code"
    });

    // Bind button
    this.signInButton.onTriggerUp.add(() => this.onSignIn());
  }

  private async onSignIn() {
    try {
      this.statusText.text = "Connecting...";
      await this.auth.authorize("your required scopes");
      this.statusText.text = "✅ Connected!";

      // Make authenticated API calls
      await this.loadUserData();
    } catch (error) {
      this.statusText.text = `❌ Error: ${error}`;
    }
  }

  private async loadUserData() {
    const token = await this.auth.getAccessToken();
    const response = await fetch("https://your-provider.com/api/user", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    print(`User: ${JSON.stringify(data)}`);
  }
}
```

## Debugging and Logging

All example controllers include standardized logging configuration:

```typescript
@input
@hint("Enable general logging (API calls, playback events, etc.)")
enableLogging: boolean = false;

@input
@hint("Enable lifecycle logging (onAwake, onStart, onUpdate, onDestroy, etc.)")
enableLoggingLifecycle: boolean = false;
```

**Enable logging to debug:**
- OAuth2 authorization flow
- API request/response cycles
- Token refresh operations
- Component lifecycle events
- User interactions and button presses

**Logging Output:**
```
2026-02-12 | SpotifyMusicController | INFO | Starting Spotify authentication
2026-02-12 | SpotifyMusicController | INFO | Successfully authenticated with Spotify
2026-02-12 | SpotifyMusicController | INFO | Successfully loaded 50 liked songs
2026-02-12 | SpotifyMusicController | INFO | Playing preview: Track Name
```

## Common OAuth2 Providers

These examples can be adapted for any OAuth2 provider:

### Google
- Authorization URI: `https://accounts.google.com/o/oauth2/v2/auth`
- Token URI: `https://oauth2.googleapis.com/token`
- Common Scopes: `email`, `profile`, `openid`

### GitHub
- Authorization URI: `https://github.com/login/oauth/authorize`
- Token URI: `https://github.com/login/oauth/access_token`
- Common Scopes: `read:user`, `user:email`, `repo`

### Discord
- Authorization URI: `https://discord.com/api/oauth2/authorize`
- Token URI: `https://discord.com/api/oauth2/token`
- Common Scopes: `identify`, `email`, `guilds`

### Spotify
- Authorization URI: `https://accounts.spotify.com/authorize`
- Token URI: `https://accounts.spotify.com/api/token`
- Common Scopes: `user-read-private`, `user-library-read`, `streaming`

## Best Practices Demonstrated

### 1. Error Handling
All examples show proper error handling with user-friendly messages:
- OAuth2 errors (authorization failed, token expired)
- Network errors (API unavailable, timeout)
- Editor mode detection (OAuth2 requires device deployment)

### 2. UI Feedback
Clear status updates keep users informed:
- "Connecting to Spotify..." during authorization
- "✅ Connected!" on success
- "❌ Connection failed: [error]" on failure
- "⚠️ Test on Spectacles device" for editor mode

### 3. Token Management
Examples demonstrate AuthKit's automatic token handling:
- Tokens persist across app restarts
- Automatic refresh when tokens expire
- Proper cleanup on sign out

### 4. API Integration
Shows real-world API usage patterns:
- Setting authorization headers
- Handling API responses
- Error checking and retry logic
- Parsing JSON responses

## Limitations

- **Editor Testing**: OAuth2 authorization requires deployment to Spectacles device (not available in Lens Studio editor)
- **Network Required**: All examples require internet connectivity for OAuth2 and API calls
- **Spotify Device Required**: SpotifyMusicController playback control requires an active Spotify device (phone/computer with Spotify open)
- **Preview Availability**: Not all Spotify tracks have preview URLs available (examples include fallback to Deezer/iTunes)

## Migration from Interactable to RectangleButton

These examples use modern UI Kit `RectangleButton` components instead of legacy `Interactable` from SpectaclesInteractionKit:

**Old Pattern (Interactable):**
```typescript
@input signInButton: Interactable;

this.signInButton.onInteractorTriggerStart((event: InteractorEvent) => {
  this.onSignIn(event);
});
```

**New Pattern (RectangleButton):**
```typescript
@input signInButton: RectangleButton;

this.signInButton.onTriggerUp.add(() => {
  this.onSignIn();
});
```

**Benefits:**
- Simpler API (no event parameter needed)
- Direct component access (no SIK.InteractionManager required)
- Better type safety
- Consistent with UI Kit design patterns

## Related Packages

- **AuthKit**: Core OAuth2 implementation library (required dependency)
- **SpectaclesUIKit**: UI components including RectangleButton
- **Utilities**: Logger and utility functions
- **SnapDecorators**: Lifecycle method decorators (@bindStartEvent, etc.)

---

## Built with 👻 by the Spectacles team <!-- --> <!-- --> <!-- --> <!-- --> <!-- -->





