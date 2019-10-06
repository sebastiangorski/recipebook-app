export class User {
  constructor(
    public email: string,
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
    // Tokens are private because a token should be retrivable in a way that will also check the validity of that token.
    // This can be achieved by setting up a getter.
    // Getter looks like a function but we access it like a property (for ex. like user.token).
    // You can't set getter to something new (can't overwrite it).
    // We set a token when we create a new user object and will always create a new one when user logs in.
    ) {}

    get token() {
      if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) { // Check if token exists or expired
        return null;
      }
      return this._token;
    }
}
