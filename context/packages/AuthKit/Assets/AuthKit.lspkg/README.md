# AuthKit 

AuthKit is a comprehensive OAuth2 authentication framework designed for Spectacles applications that need to integrate with external services requiring user authorization. It provides a complete implementation of OAuth2 flows including Authorization Code Flow with PKCE (Proof Key for Code Exchange) and Implicit Flow, along with automatic token management, refresh capabilities, and persistent session storage.

## Features

- **OAuth2 Authorization Code Flow with PKCE**: Secure authorization flow with cryptographic code challenge
- **OAuth2 Implicit Flow**: Simplified flow for client-side applications
- **Automatic Token Refresh**: Seamlessly refreshes expired access tokens using refresh tokens
- **Persistent Token Storage**: Saves tokens across sessions using persistent storage
- **Deep Link Integration**: Handles OAuth callbacks via Spectacles deep link system
- **Token Expiration Management**: Automatically checks and handles token expiration
- **Secure Client Authentication**: Supports both public and confidential OAuth2 clients
- **Type-Safe API**: Fully typed TypeScript interfaces for reliable development

## Quick Start

Initialize the OAuth2 authenticator with your provider's configuration:

```typescript
import { OAuth2 } from "AuthKit.lspkg/Core/OAuth2";

// Create OAuth2 instance with Authorization Code Flow
const auth = new OAuth2({
  clientId: "your-client-id",
  authorizationUri: "https://provider.com/oauth/authorize",
  tokenUri: "https://provider.com/oauth/token",
  authenticationType: "code",
  clientSecret: "your-client-secret" // Optional, for confidential clients
});

// Check if user is already authorized
if (!auth.isAuthorized) {
  // Start authorization flow
  await auth.authorize("read write profile");
}

// Get current access token (auto-refreshes if expired)
const accessToken = await auth.getAccessToken();

// Use token for API calls
const response = await fetch("https://api.provider.com/user", {
  headers: { "Authorization": `Bearer ${accessToken}` }
});
```

## Script Highlights

- **OAuth2.ts**: Core OAuth2 authenticator implementing both Authorization Code Flow with PKCE and Implicit Flow. Manages the complete authorization lifecycle including generating authorization URIs with PKCE code challenges, handling deep link callbacks, exchanging authorization codes for tokens, and automatic token refresh. Provides a clean async/await API for authorization and token management.

- **TokenManager.ts**: Handles secure token storage and retrieval using Lens Studio's persistent storage system. Manages token lifecycle including saving tokens to persistent storage, restoring tokens on app restart, clearing tokens on sign out, and refreshing expired tokens via HTTP requests to the token endpoint. All token operations are automatically handled with proper error checking.

- **Token.ts**: Data structure representing OAuth2 tokens with automatic expiration timestamp calculation. Contains access token, optional refresh token, expiration time in seconds, and calculated expiration timestamp. Provides a buffer of 60 seconds before actual expiration to ensure tokens are refreshed proactively before they expire.

## OAuth2 Configuration

### Authorization Code Flow (Recommended)

The most secure OAuth2 flow, using PKCE for additional security:

```typescript
const auth = new OAuth2({
  clientId: "your-client-id",
  clientSecret: "your-client-secret", // Optional
  authorizationUri: "https://provider.com/oauth/authorize",
  tokenUri: "https://provider.com/oauth/token",
  refreshUri: "https://provider.com/oauth/token", // Optional, defaults to tokenUri
  authenticationType: "code",
  redirectUri: "https://www.spectacles.com/deeplink/specslink/oauth2redirect/unsecure"
});
```

### Implicit Flow

Simplified flow for public clients (less secure, not recommended for sensitive data):

```typescript
const auth = new OAuth2({
  clientId: "your-client-id",
  authorizationUri: "https://provider.com/oauth/authorize",
  tokenUri: "https://provider.com/oauth/token", // Not used in implicit flow
  authenticationType: "implicit",
  redirectUri: "https://www.spectacles.com/deeplink/specslink/oauth2redirect/unsecure"
});
```

## Core API Methods

### Authorization

```typescript
// Start the OAuth2 authorization process
async authorize(scope?: string): Promise<Token | undefined>

// Example usage with scopes
try {
  const token = await auth.authorize("read write profile");
  print("Authorization successful!");
  print(`Access Token: ${token.access_token}`);
} catch (error) {
  print(`Authorization failed: ${error}`);
}
```

### Getting Access Tokens

```typescript
// Get current access token, automatically refreshing if expired
async getAccessToken(): Promise<string>

// Example usage
const accessToken = await auth.getAccessToken();
const response = await fetch("https://api.provider.com/data", {
  headers: { "Authorization": `Bearer ${accessToken}` }
});
```

### Checking Authorization Status

```typescript
// Check if user is currently authorized (synchronous)
get isAuthorized(): boolean

// Example usage
if (auth.isAuthorized) {
  print("User is logged in");
  this.showDashboard();
} else {
  print("User needs to log in");
  this.showLoginButton();
}
```

### Token Refresh

```typescript
// Manually refresh the access token
async refreshToken(): Promise<void>

// Example usage (usually automatic)
if (tokenIsExpiringSoon) {
  await auth.refreshToken();
  print("Token refreshed successfully");
}
```

### Sign Out

```typescript
// Sign out and clear stored tokens
signOut(): void

// Example usage
auth.signOut();
print("User signed out");
this.showLoginScreen();
```

## Advanced Usage

### Complete Authentication Flow with UI

Here's a complete example of integrating OAuth2 with a user interface:

```typescript
import { OAuth2 } from "AuthKit.lspkg/Core/OAuth2";
import { BaseButton } from "SpectaclesUIKit.lspkg/Scripts/Components/Button/BaseButton";

@component
export class AuthenticationManager extends BaseScriptComponent {
  @input loginButton: BaseButton;
  @input logoutButton: BaseButton;
  @input statusText: Text;
  @input contentContainer: SceneObject;

  private auth: OAuth2;

  onAwake() {
    // Initialize OAuth2
    this.auth = new OAuth2({
      clientId: "your-client-id",
      clientSecret: "your-client-secret",
      authorizationUri: "https://provider.com/oauth/authorize",
      tokenUri: "https://provider.com/oauth/token",
      authenticationType: "code"
    });

    // Setup button handlers
    this.loginButton.onTriggerUp.add(() => this.handleLogin());
    this.logoutButton.onTriggerUp.add(() => this.handleLogout());

    // Check initial auth state
    this.updateUI();
  }

  private async handleLogin() {
    try {
      this.statusText.text = "Opening authorization...";
      this.loginButton.enabled = false;

      await this.auth.authorize("read write profile");

      this.statusText.text = "Logged in successfully!";
      this.updateUI();
      await this.loadUserData();
    } catch (error) {
      this.statusText.text = `Login failed: ${error}`;
      this.loginButton.enabled = true;
    }
  }

  private handleLogout() {
    this.auth.signOut();
    this.statusText.text = "Logged out";
    this.updateUI();
  }

  private updateUI() {
    const isAuth = this.auth.isAuthorized;
    this.loginButton.enabled = !isAuth;
    this.logoutButton.enabled = isAuth;
    this.contentContainer.enabled = isAuth;

    if (isAuth) {
      this.statusText.text = "Authenticated";
    } else {
      this.statusText.text = "Please log in";
    }
  }

  private async loadUserData() {
    const accessToken = await this.auth.getAccessToken();

    const response = await fetch("https://api.provider.com/user", {
      headers: { "Authorization": `Bearer ${accessToken}` }
    });

    const userData = await response.json();
    print(`User data: ${JSON.stringify(userData)}`);
  }
}
```

### Making Authenticated API Calls

Create a helper class for authenticated requests:

```typescript
import { OAuth2 } from "AuthKit.lspkg/Core/OAuth2";

export class AuthenticatedAPIClient {
  constructor(private auth: OAuth2, private baseUrl: string) {}

  async get(endpoint: string): Promise<any> {
    const accessToken = await this.auth.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }

  async post(endpoint: string, data: any): Promise<any> {
    const accessToken = await this.auth.getAccessToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return await response.json();
  }
}

// Usage
const apiClient = new AuthenticatedAPIClient(auth, "https://api.provider.com");
const userData = await apiClient.get("/user/profile");
const updateResult = await apiClient.post("/user/settings", { theme: "dark" });
```

### Handling Token Expiration in Long-Running Sessions

```typescript
@component
export class SessionManager extends BaseScriptComponent {
  @input auth: OAuth2;

  private updateEvent: SceneEvent;

  onAwake() {
    // Check token validity every 5 minutes
    this.updateEvent = this.createEvent("UpdateEvent");
    this.updateEvent.bind(() => this.checkTokenStatus());

    let lastCheck = 0;
    const CHECK_INTERVAL = 300000; // 5 minutes

    this.createEvent("UpdateEvent").bind(() => {
      const now = Date.now();
      if (now - lastCheck > CHECK_INTERVAL) {
        lastCheck = now;
        this.checkTokenStatus();
      }
    });
  }

  private async checkTokenStatus() {
    if (!this.auth.isAuthorized) {
      print("Session expired, user needs to re-authenticate");
      this.handleSessionExpired();
      return;
    }

    try {
      // This will automatically refresh if needed
      await this.auth.getAccessToken();
      print("Token is valid or was successfully refreshed");
    } catch (error) {
      print(`Token refresh failed: ${error}`);
      this.handleSessionExpired();
    }
  }

  private handleSessionExpired() {
    // Show re-login UI or handle session expiration
    print("Please log in again");
  }
}
```

## Security Considerations

### PKCE (Proof Key for Code Exchange)

AuthKit implements PKCE for Authorization Code Flow, which provides additional security for public clients:

```typescript
// PKCE flow automatically generates:
// 1. Code Verifier: Random 128-character string
// 2. Code Challenge: SHA256 hash of the verifier (base64url encoded)
// 3. Code Challenge Method: S256

// The provider verifies the code challenge during token exchange
// This prevents authorization code interception attacks
```

### State Parameter Validation

All OAuth2 flows include state parameter validation to prevent CSRF attacks:

```typescript
// AuthKit automatically:
// 1. Generates a random state UUID for each authorization request
// 2. Validates the state parameter in the callback
// 3. Rejects callbacks with mismatched state values
```

### Token Storage

Tokens are stored securely using Lens Studio's persistent storage:

```typescript
// Tokens are stored per client ID
// Access tokens and refresh tokens are persisted across sessions
// Call signOut() to clear stored tokens when user logs out
```

## Deep Link Configuration

AuthKit uses Spectacles deep link system for OAuth callbacks. The default redirect URI is:

```
https://www.spectacles.com/deeplink/specslink/oauth2redirect/unsecure
```

When configuring your OAuth2 provider, register this as an allowed redirect URI. You can also specify a custom redirect URI if needed:

```typescript
const auth = new OAuth2({
  clientId: "your-client-id",
  authorizationUri: "https://provider.com/oauth/authorize",
  tokenUri: "https://provider.com/oauth/token",
  authenticationType: "code",
  redirectUri: "https://your-custom-redirect.com/callback"
});
```

## Error Handling

AuthKit provides clear error messages for common scenarios:

```typescript
try {
  await auth.authorize("read write");
} catch (error) {
  // Common errors:
  // - "Authorization not supported in editor mode"
  // - "OAuth error: [error_code]"
  // - "Authorization cancelled"
  // - "Token exchange failed: [status] [error]"
  print(`Authorization error: ${error}`);
}

try {
  const token = await auth.getAccessToken();
} catch (error) {
  // Common errors:
  // - "Not authorized. Call authorize() first."
  // - "No refresh token available"
  // - "Failed to refresh token"
  print(`Token error: ${error}`);
}
```

## Limitations

- **Editor Support**: OAuth2 authorization is not available in Lens Studio editor mode (device deployment required)
- **Deep Link Dependency**: Requires Spectacles deep link system for OAuth callbacks
- **Network Requirement**: Requires internet connectivity for authorization and token operations
- **Token Format**: Only supports standard OAuth2 token responses (access_token, refresh_token, expires_in)

## Testing in Lens Studio

Since OAuth2 requires device deployment, test your integration with these strategies:

1. **Mock Authentication**: Create a mock OAuth2 class for editor testing
2. **Early Authorization**: Authorize early in the experience to handle any auth failures gracefully
3. **Offline Handling**: Design UI to handle both authenticated and non-authenticated states
4. **Token Persistence**: Test that tokens persist correctly across app restarts

---

## Built with 👻 by the Spectacles team <!-- --> <!-- --> <!-- --> <!-- -->



