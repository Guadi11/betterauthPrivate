export interface UserSession {
    user: {
      id: string;
      username: string;
      email?: string;
      name?: string;
    };
  }