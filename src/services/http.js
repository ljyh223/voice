class Http {
  static baseUrl = "localhost:9999";

  static async get(url) {
    try {
      const response = await fetch(`http://${this.baseUrl}${url}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      this.handleResponseErrors(response);
      return response.json();
    } catch (error) {
      console.error("GET Request Error:", error);
      throw error;
    }
  }

  static async post(url, data) {
    try {
      const response = await fetch(`http://${this.baseUrl}${url}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      this.handleResponseErrors(response);
      return response.json();
    } catch (error) {
      console.error("POST Request Error:", error);
      throw error;
    }
  }

  static async put(url, data) {
    try {
      const response = await fetch(`http://${this.baseUrl}${url}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      this.handleResponseErrors(response);
      return response.json();
    } catch (error) {
      console.error("PUT Request Error:", error);
      throw error;
    }
  }

  static async delete(url, data) {
    try {
      const response = await fetch(`http://${this.baseUrl}${url}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      this.handleResponseErrors(response);
      return response.json();
    } catch (error) {
      console.error("DELETE Request Error:", error);
      throw error;
    }
  }

  static handleResponseErrors(response) {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  }
}

export default Http;
