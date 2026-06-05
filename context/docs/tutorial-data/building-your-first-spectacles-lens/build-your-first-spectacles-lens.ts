import { TutorialData } from '../../../../src/refresh/components/Tutorial/Tutorial';

const buildYourFirstSpectaclesLensTutorial: TutorialData = {
  series: 'Getting Started With Spectacles',
  title: 'Building Your First Spectacles Lens',
  category: 'Spectacles',
  description: `This tutorial walks through the steps to build your first Lens on Spectacles. 

  Through this tutorial you will become familiar with the workflow of Lens Studio and be ready to continue your Spectacles journey to build robust AR experiences. 

  `,
  prerequisites: `* Download the latest compatible version of [Lens Studio](https://ar.snap.com/download)
* [Download the Spectacles mobile app](./spectacles-lens-setup#download-spectacles-app)
  `,
  duration: '20 min',
  lensStudioVersion: '5.15.0+',
  summary: `Great job! With this tutorial completed, you are now familiar with the workflow for building Lenses for Spectacles.

   As a next step, continue onto the [Spectacles Interaction Kit](../../spectacles-frameworks/spectacles-interaction-kit/get-started) section of the documentation to get up to speed on pre-built ways to interact with your AR content. 
    
This is just the beginning of your journey. Take a look at the sample projects to explore all of the Spectacles API in action.

You can find [our samples](https://github.com/specs-devs/samples) on the Lens Studio home page or on GitHub.

Happy Building!`,
  sections: [
    {
      title: 'Basic Example',
      description: '',
      steps: [
        {
          title: 'Open a New Project',
          description:
            'This tutorial series will build a Lens starting from the default Lens Studio project. <br><br> Open up the lens studio home page, and select the Base Template Project for Spectacles.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-01.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add a 3D Asset to scene',
          description:
            'In the top left of Lens Studio, you will find the Scene Hierarchy panel. The Scene Hierarchy panel contains everything that is in your Lens. <br><br> Click the Asset Library button on top of that and search for Red Panda in the 3D section. <br><br> Click the import button to import the asset.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-02.mp4',
            type: 'video',
          },
        },
        {
          title: 'Adjust the placement of the 3D Asset',
          description:
            'Import the Asset dragging it in the Hierarchy and then modify it by either clicking its name in the Hierarchy panel or selecting it directly in the main Scene view. Then you can select a modifier tool in the top bar or by using the following hotkeys: <ul><li> W: Translate tool, for changing the position. </li><li> E: Rotate tool, for changing the rotation. </li><li> R: Scale tool, for changing the size. </li> </ul> You can also adjust your view of the object:  <ul><li> F: focus view on selected object. </li><li> Mouse Scroll: change zoom.</li><li> Middle Mouse click + drag: move through scene. </li><li> Right Mouse click + drag: rotate the view in the scene. </li></ul>',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-03.mp4',
            type: 'video',
          },
        },
        {
          title: 'Move around in Preview',
          description:
            'You can now move around the world in the Preview window: <ul><li> Right Mouse click + drag: rotate the view in the scene. </li> <li>WASD keyboard keys: move through the scene.</li></ul>',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-04.mp4',
            type: 'video',
          },
        },
        {
          title: 'Connect Spectacles and Preview',
          description:
            'You can now build your lens: <br><br> Ensure your Spectacles are turned on and select the Preview Spectacles button in the top-right corner. <br><br> Click on Preview Lens. <br><br> You should plugin in your spectacles via cable to your laptop. If you want to learn more about spectacles connectivity take a look at [Connecting Lens Studio to Spectacles](https://developers.snap.com/spectacles/get-started/start-building/connecting-lens-studio-to-spectacles)',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-05.mp4',
            type: 'video',
          },
        },
        {
          title: 'Test the Lens on Spectacles',
          description:
            'Now you can move around your space and see your Red Panda in the world. <br><br> Great! <br><br> Now we have successfully tested our Lens and can see that everything is working perfectly.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-demo-1.mp4',
            type: 'video',
          },
        },
      ],
    },
    {
      title: 'Spawn Object on Surface',
      description: '',
      steps: [
        {
          title: 'Download the Surface Placement package',
          description:
            'Download the Surface Placement package from the Asset Library.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-06.mp4',
            type: 'video',
          },
        },
        {
          title: 'Add Surface Placement to Scene',
          description:
            'Remove our panda prefab and drag the Surface Placement Prefab in the scene hierarchy. <br><br> Test the Surface Placement in the Preview Panel.',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-07.mp4',
            type: 'video',
          },
        },
        {
          title: 'Build your lens again',
          description:
            'You can now build your lens again: <br><br> Ensure your Spectacles are turned on and select the Preview Spectacles button in the top-right corner. <br><br> Click on Preview Lens',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-08.mp4',
            type: 'video',
          },
        },
        {
          title: 'Test Surface Placement on Device',
          description:
            'Now you can test the surface placement functionality on your Spectacles device. <br><br> Great job!',
          snippet: {
            source:
              '/tutorials/buildYourFirstSpectaclesLens/building-your-first-lens-w-spectacles-demo-2.mp4',
            type: 'video',
          },
        },
      ],
    },
  ],
};

export default buildYourFirstSpectaclesLensTutorial;
