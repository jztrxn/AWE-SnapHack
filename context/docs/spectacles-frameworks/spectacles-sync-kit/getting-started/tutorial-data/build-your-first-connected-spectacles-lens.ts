import { TutorialData } from '../../../../../../src/refresh/components/Tutorial/Tutorial';
import ControllerScriptExample from './code-examples/Controller.ts?raw';
import PieceScriptExample from './code-examples/Piece.ts?raw';

const buildYourFirstSpectaclesConnectedLensTutorial: TutorialData = {
  series: 'Getting started with Connected Lenses',
  title: 'Build Your First Spectacles Connected Lens',
  category: 'Spectacles',
  description: `In this tutorial we will build a simplified version of the Tic Tac Toe example from the SpectaclesSyncKit package that you can find in [Samples](../../../about-spectacles-features/samples#connected-lenses). 
    We will encounter many concepts and components that are fundamental in building an understanding of how to use SpectaclesSyncKit: \n
* How to sync objects between multiple users
* How to handle turn-based multiplayer logic
* How to make objects interactable in a shared space
* How to create prefabs and instantiate them across the network
  `,
  prerequisites: `* A basic understanding of how to build Spectacles Lenses in Lens Studio (See [Getting Started](../../../get-started/start-building/build-your-first-spectacles-lens-tutorial) for a step-by-step introduction)
* Basic understanding of Scripting in Lens Studio using Typescript (See [Scripting](../../../../../lens-studio/features/scripting/typescript) for an overview)
  `,
  duration: '45 min',
  lensStudioVersion: '5.15.0+',
  summary: `## 🎉 Congratulations!

You've built your first multiplayer Connected Lens! You now have a working Tic Tac Toe game where two Spectacles users can play together in the same physical space.

### What You Built

Your Connected Lens includes:
- ✅ Real-time object synchronization between multiple users
- ✅ Turn-based multiplayer game logic
- ✅ Interactive 3D game pieces (X and O)
- ✅ Dynamic prefab instantiation across the network
- ✅ Player role assignment (X player, O player)
- ✅ Game state management synced across all devices

### What You Encountered

Through building this game, you encountered the core concepts of Spectacles Sync Kit:

**SyncEntity & StorageProperty**  
You created a synced game controller that shares state (turn count) across all players automatically.

**SyncTransform**  
You made objects sync their position and rotation in real-time between users.

**Networked Events**  
You used events to coordinate game start between players without managing complex networking code.

**Prefab Instantiation**  
You discovered why prefabs are essential for multiplayer (spawning objects during gameplay) and how to instantiate them across the network.

**Session Lifecycle**  
You used "notifyOnReady()" to ensure your code only runs after the multiplayer session is fully initialized.

### Test Your Game on Real Spectacles

Ready to try your game on actual Spectacles devices?

1. In Lens Studio, with your Spectacles connected, click **Preview Lens** (top right)
2. Follow the pairing instructions to connect your Spectacles
3. The lens will be pushed to your device
4. Have a friend nearby also load the lens
5. Both users tap **Multiplayer** in the lens UI
6. Start playing!

**Tip**: You'll need to be in the same physical location for the colocated multiplayer to work.

## Take It Further

Now that you have a working game, here are some ideas to enhance it:

### Easy Enhancements (10-20 minutes)
- **Add sound effects**: Play audio when pieces are placed
- **Change the appearance**: Use custom 3D models instead of Torus/Capsule
- **Add visual feedback**: Make pieces glow when it's your turn

### Intermediate Enhancements (30-60 minutes)
- **Add a 3x3 grid**: Create snap points so pieces align properly
- **Win detection**: Check for three-in-a-row and display a winner message
- **Reset button**: Let players start a new game without restarting the lens
- **Turn indicator**: Add UI showing whose turn it is

### Advanced Enhancements (1-2 hours)
- **Add a 3x3x3 grid**: Make the game truly 3D by adding a third dimension to the grid.
- **Score tracking**: Keep track of wins across multiple games
- **Time limits**: Add a countdown timer for each turn
- **Replay system**: Record and replay completed games

## What's Next?

### Deep Dive into Spectacles Sync Kit

Ready to master Connected Lenses? Explore these guides:

- **[Session Controller](../features/session-controller)** - Learn to manage users, track connections, and handle disconnections
- **[Storage Properties](../features/storage-properties)** - Advanced state synchronization patterns and data types
- **[Networked Events](../features/networked-events)** - Send custom messages between players
- **[Prefab Instantiation](../features/prefab-instantiation)** - Advanced spawning patterns and ownership models
- **[Lifecycle](../lifecycle)** - Understand the complete setup flow and timing

### Explore More Examples

See what else you can build with Spectacles Sync Kit:

- **[Sample Projects](https://github.com/specs-devs/samples?tab=readme-ov-file#connected-lenses)** - Complete example projects demonstrating different multiplayer patterns
- **[Building Connected Lenses Guide](../../../about-spectacles-features/connected-lenses/building-connected-lenses)** - Best practices and testing strategies

### Build Something New

Try these other multiplayer experiences:

- **Collaborative art canvas** - Let users draw together in 3D space
- **Shared pet/creature** - Create a virtual pet that both users can interact with
- **Rhythm game** - Build a multiplayer music game with synced timing
- **Puzzle game** - Create a cooperative puzzle that requires teamwork
- **Sports mini-game** - Build a simple ball game like air hockey

## Get Help & Share Your Work

### Stuck or Have Questions?

- **[Spectacles Forum](https://www.reddit.com/r/Spectacles/)** - Ask questions and get help from the community
- **[Discord](https://discord.gg/snapar)** - Chat with other Spectacles developers
- **[Support](https://support.spectacles.com/)** - Official Spectacles support

## Additional Resources

- **[Connected Lenses Overview](./overview)** - Understand the architecture and limitations
- **[Spectacles Interaction Kit](../../spectacles-interaction-kit/get-started)** - Learn more about hand tracking and gestures
- **[Spectacles UI Kit](../../spectacles-ui-kit/get-started)** - Learn more about creating interactive AR user interfaces for the Spectacles platform
`,
  sections: [
    {
      title: 'Initial setup',
      description:
        'We will start by setting up our project with the SpectaclesSyncKit package.',
      steps: [
        {
          title: 'Open a New Project',
          description:
            'In this tutorial we will build a Lens starting from the default Lens Studio Spectacles project. \n\n Open up the **Lens Studio home page**, and select the **Base Template Project for Spectacles**.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-1.mp4',
            type: 'video',
          },
        },
        {
          title: 'Install the SpectaclesSyncKit package',
          description:
            'In the **Asset Library**, in the **Spectacles** section, search for **SpectaclesSyncKit** and install the latest version.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-2.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add SpectaclesSyncKit to the Scene Hierarchy',
          description:
            'In the Asset Browser, under **Packages**, expand the SpectaclesSyncKit package and drag the **SpectaclesSyncKit prefab** into the Scene Hierarchy.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-3.mp4',
            type: 'video',
          },
        },
        {
          title: 'Open a second Preview panel',
          description: `Open a second Preview panel from **Window > Preview**. \n
This will act as our second user in the connected lens session. Set the second Preview panel to **Spectacles (2024)** and the Preview type to **Interactive Preview**. We should now see both panels show the same Session ID at the top (something like "Session: 6491296d-35c0-4f93-8e90-599d784dc48e"). This means they're connected to the same multiplayer session.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-4.mp4',
            type: 'video',
          },
        },
        {
          title: 'Start a multiplayer session',
          description: `Start a multiplayer session by clicking the **Multiplayer** button in the lens UI for both preview panels. We can now see the example ghost appear in both Preview panels. Try clicking and dragging the ghost in Preview 1 - we should immediately see it move in Preview 2 as well. This is real-time synchronization in action!
            \n
If you can't see the example ghost:
* Make sure both Preview panels show the same Session ID
* Click the Multiplayer button in both preview panels
* Reset the preview panels
* Watch the TypeScript Status panel
            `,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-5.mp4',
            type: 'video',
          },
        },
        {
          title: 'Disable the example ghost',
          description:
            'Disable the example ghost by toggling off **SpectaclesSyncKit > ColocatedWorld > EnableOnReady > Examples**.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-6.mp4',
            type: 'video',
          },
        },
      ],
    },
    {
      title: 'Create the basic player components',
      description:
        'We will now recreate an object similar to the example ghost that will allow both users to play Tic Tac Toe. We will start with the O component.',
      steps: [
        {
          title: 'Create the O component',
          description: `
- Let's add a **Torus** to the Scene Hierarchy
- Position it under **SpectaclesSyncKit > ColocatedWorld > EnableOnReady** 
- Rotate it by **90** degrees on the **X** axis so that it faces the camera
- Rename the Torus object to **O**. \n
By adding this to *ColocatedWorld*, we are using a shared set of coordinates for all users; by adding it to *EnableOnReady*, we are ensuring that the Torus is only instantiated after the session is ready.
          \n
**N.B.**: The torus might be created behind the camera. Move around if you can't immediately see it.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-7.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add the O component to the Connected Lens network',
          description: `In our **O** Scene Object, click **Add Component** and search for **SyncTransform**. This will wire the Torus' position, rotation and scale to the SyncKit network.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-8.mp4',
            type: 'video',
          },
        },
        {
          title: 'Make the O component interactable',
          description: `In our O object, also add an **Interactable** component as well as a **InteractableManipulation** component. This will allow us to interact with the O using SpectaclesInteractionKit.
             \n Try interacting with the O in Preview 1. We should see the O move in both Preview panels simultaneously. If both panels show the same movement, our synchronization is working correctly.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-9.mp4',
            type: 'video',
          },
        },
        {
          title: 'Create the X component',
          description: `Let's create our X component now. \n
- Create a Scene Object by right clicking in our scene hierarchy and selecting **Create Scene Object**. 
- Name the Scene Object **X**
- Place it in the Scene Hierarchy under **SpectaclesSyncKit > ColocatedWorld > EnableOnReady**
- Let's position right next to the O component by changing its **X** position coordinate to **10**`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-10.mp4',
            type: 'video',
          },
        },
        {
          title: 'Make it resemble an X',
          description: `- Add a **Capsule** object to the X Scene Object. 
- Edit the Capsule scale to be **X: 5, Y: 10, Z: 5** 
- Edit the Capsule's **Z rotation** to be **45** degrees. 
- Add a second **Capsule** under the X Scene Object 
- Edit the second Capsule's scale to be **X: 5, Y: 10, Z: 5** 
- Edit the second Capsule's **Z** rotation to be **-45** degrees. \n
With a little help from our imagination, it should resemble an X now!`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-11.mp4',
            type: 'video',
          },
        },
        {
          title:
            'Make the X component interactable and connected to the network',
          description: `In the X Scene Object, add an **Interactable** component, an **InteractableManipulation** component and a **SyncTransform** component. This will allow the user to interact with the X component using SpectaclesInteractionKit, much like the O component we made previously.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-12.mp4',
            type: 'video',
          },
        },
      ],
    },
    {
      title: 'Build the game logic',
      description:
        'We now have the two basic components we need to play Tic Tac Toe, but the game is not quite fully fleshed out yet. Both players can still interact with the pieces and move them around as they please even after finalising a move. We also only have two pieces, we need way more! We will now build the game logic for our Tic Tac Toe game. This will handle the game state management, turn logic and piece movement.',
      steps: [
        {
          title: 'Create the controller script',
          description: `Let's create our Controller script. This will handle the game logic and state management. At the top of the scene hierarchy, create a new TypeScript scene object and name it **Controller**.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-13.mp4',
            type: 'video',
          },
        },
        {
          title: 'Open the Controller script in the Script Editor',
          description: `We will see a new **Untitled TypeScript** file in the Asset Browser, under Assets. Rename this to **Controller**. Double click it to open it in the Script Editor.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-14.jpg',
            type: 'image',
          },
        },
        {
          title: 'Edit the controller script',
          description: `The Script Editor opens with a new class containing an **onAwake** function. This function runs automatically when our script loads. As the first step, we want to set up our controller. First, we want to set up a new SyncEntity and add a storage property to keep track of how many turns have been taken by our players. We also want to add a public method to notify the controller when a turn has been finished. We will see how this is useful later on.`,
          snippet: {
            title: 'Controller.ts',
            source: ControllerScriptExample,
            type: 'code',
            language: 'typescript',
            excludeLines: [
              [3, 5],
              [9, 16],
              [22, 25],
              [32, 82],
              [88, 96],
            ],
          },
        },
        {
          title: 'Create the Pieces script',
          description: `Before proceeding further with the Controller script, let's create a script to manage our pieces. This will handle the pieces logic and internal state management of each piece. In the **Asset browser** create a new TypeScript File and name it **Pieces**. Double click it to open it in the Script Editor.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-15.jpg',
            type: 'image',
          },
        },
        {
          title: 'Edit the Pieces script',
          description: `The Pieces script will be responsible for handling the movement of the piece, set who can move it and inform the Controller when a turn is complete.`,
          snippet: {
            title: 'Piece.ts',
            source: PieceScriptExample,
            type: 'code',
            language: 'typescript',
          },
        },
        {
          title: 'Add the Pieces script to the X and O Scene Objects',
          description: `We can now drag and drop the Pieces script onto our X and O Scene Objects. The Pieces script now asks for two inputs: **Controller** and **InteractableManipulation**. Drag and drop the **Controller** scene object from the Scene hierarchy onto the box and select the X/O Scene object for the **InteractableManipulation** input.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-16.mp4',
            type: 'video',
          },
        },
        {
          title: 'Create X and O prefabs',
          description: `Our X and O Pieces are complete, we can now turn these into Prefabs. In the Scene Hierarchy, right click on the X and O Scene Objects and select **Save as Prefab**. We should see them in the **Asset Browser** as prefabs now.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-17.mp4',
            type: 'video',
          },
        },
        {
          title: 'Delete the X and O Scene Objects',
          description: `We can now delete the X and O Scene Objects from the Scene Hierarchy. The Controller will be in charge of instantiating the pieces prefabs`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-18.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add the Instantiator component to the Scene Hierarchy',
          description: `Let's add our Instantiator script to the Scene Hierarchy. In the Asset Browser, go to **Packages > SpectaclesSyncKit > Components > Instantiator**. Drag and drop the **Instantiator** script onto the Scene Hierarchy.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-19.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add X and O prefabs to the Instantiator script',
          description: `In the Scene Hierarchy, click on the newly created Instantiator component and add **X and O prefabs** to the Prefabs list. This will allow our **Instantiator** to create the pieces prefabs across the network.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-20.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add Instantiator and Prefabs inputs to the Controller script',
          description: `Let's continue editing our Controller to support this new functionality. Let's add some new inputs to the **Controller script** for the **Instantiator** and the pieces prefabs using the **@input** decorator.`,
          snippet: {
            title: 'Controller.ts',
            source: ControllerScriptExample,
            type: 'code',
            language: 'typescript',
            excludeLines: [
              [4, 5],
              [22, 25],
              [32, 82],
              [88, 96],
            ],
            highlightRanges: [[8, 13]],
          },
        },
        {
          title:
            'Add the X Prefab, O Prefab and Instantiator inputs to the Controller script scene object',
          description: `Right click on the **Controller** scene object in the Scene Hierarchy and wire up the correct inputs. **Instantiator** will be the Instantiator script we created earlier in the Scene Hierarchy, and the **X Prefab**" and **O Prefab** inputs will be the X and O prefabs we saved earlier in the Asset Browser.`,
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesConnectedLens/build-your-first-spectacles-connected-lens-21.mp4',
            type: 'video',
          },
        },
        {
          title: 'Use the new inputs in the Controller script',
          description: `Let's continue editing out Controller script to make use of the new inputs. We will add logic to start up the game once the session is ready (when both the X and O players have joined the game). For now, only the X component will spawn, and only the first player to join the game will be able to move it. Once it's moved, it is not interactable anymore.`,
          snippet: {
            title: 'Controller.ts',
            source: ControllerScriptExample,
            type: 'code',
            language: 'typescript',
            excludeLines: [
              [31, 49],
              [92, 92],
            ],
            highlightRanges: [
              [4, 5],
              [22, 24],
              [31, 62],
              [70, 77],
            ],
          },
        },
        {
          title: 'Add turn and game management logic to the Controller script',
          description: `Let's add the remaining functionality to our Controller script to handle turn and game management. Every time the turnsCount storage property we progress to the next turn proceed to let the next player play. If the turnsCount is equal to the MAX_TURNS, we will set the isGameOver flag to true and send an event to the pieces to stop them from being moved.`,
          snippet: {
            title: 'Controller.ts',
            source: ControllerScriptExample,
            type: 'code',
            language: 'typescript',
            highlightRanges: [
              [31, 49],
              [92, 92],
            ],
          },
        },
      ],
    },
  ],
};

export default buildYourFirstSpectaclesConnectedLensTutorial;
