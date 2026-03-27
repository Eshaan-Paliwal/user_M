import { projectId, publicAnonKey } from "/utils/supabase/info";

// const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-1304f273`;
const BASE_URL = "http://localhost:3000/make-server-1304f273";

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  token?: string;
  user?: any;
  total?: number;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        // If not JSON, get text for better error messages
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Server returned non-JSON")) {
        throw e;
      }
      throw new Error(`Server error: Unable to parse response (${response.status})`);
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || data.details || `Server error: ${response.status}`;
      console.error("API Error Response:", data);
      throw new Error(errorMsg);
    }

    return data;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<T> {
    try {
      console.log(`Making request to: ${BASE_URL}${endpoint}`);
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        mode: 'cors',
      });
      return this.handleResponse<T>(response);
    } catch (error: any) {
      console.error(`API Error for ${endpoint}:`, error);
      
      // Provide more helpful error messages
      if (error.message === "Failed to fetch") {
        throw new Error(
          "Unable to connect to server. The backend may not be deployed yet. Please wait a moment and try again."
        );
      }
      
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(credentials),
    });
  }

  // User endpoints
  async getUsers(): Promise<ApiResponse> {
    return this.makeRequest("/api/users", {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
  }

  async getUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/users/${userId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/api/users", {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  }

  async updateUser(
    userId: string,
    userData: { name?: string; email?: string; role?: string; password?: string }
  ): Promise<ApiResponse> {
    return this.makeRequest(`/api/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
  }
}

export const api = new ApiService();