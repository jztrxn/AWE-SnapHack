declare namespace global {
  let sessionController: import('SpectaclesSyncKit.lspkg/Core/SessionController').SessionController;
}

// Re-add the index signature removed in 5.20 studio.d.ts so that
// @input properties (e.g. script.instantiator) typecheck without casts.
interface ScriptComponent {
  [index: string]: any;
}

declare module 'SpectaclesSyncKit.lspkg/Components/Instantiator' {
  export const Instantiator: any;
  export type Instantiator = any;
  export const InstantiationOptions: any;
  export type InstantiationOptions = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/NetworkMessage' {
  export type NetworkMessage<T = any> = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/NetworkRootInfo' {
  export type NetworkRootInfo = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/PropertyType' {
  export const PropertyType: any;
  export type PropertyType = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/SessionController' {
  export const SessionController: any;
  export type SessionController = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/StorageProperty' {
  export const StorageProperty: any;
  export type StorageProperty<T = any> = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/StoragePropertySet' {
  export const StoragePropertySet: any;
  export type StoragePropertySet = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/StorageTypes' {
  export const StorageTypes: any;
  export type StorageTypes = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/SyncEntity' {
  export const SyncEntity: any;
  export type SyncEntity = any;
}

declare module 'SpectaclesSyncKit.lspkg/Core/SyncSnapshot' {
  export const SnapshotBufferOptions: any;
  export type SnapshotBufferOptions = any;
}

declare module 'SpectaclesSyncKit.lspkg/StartMenu/Scripts/ErrorMessageController' {
  export const ErrorMessageController: any;
  export type ErrorMessageController = any;
  export const ErrorType: any;
  export type ErrorType = any;
}

declare module 'SpectaclesSyncKit.lspkg/StartMenu/Scripts/StartModeController' {
  export const StartModeController: any;
  export type StartModeController = any;
  export const StartMode: any;
  export type StartMode = any;
}
