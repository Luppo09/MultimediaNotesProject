// auth.js - Sistema de autenticação JWT 
class AuthService {
  constructor() {
    this.baseUrl = 'http://localhost:5145/api';
    this.tokenKey = 'jwt_token';
    this.userKey = 'user_data';
  }

  // Salvar token no localStorage
  saveToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  // Obter token do localStorage
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Salvar dados do usuário
  saveUser(userData) {
    localStorage.setItem(this.userKey, JSON.stringify(userData));
  }

  // Obter dados do usuário
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Verificar se está autenticado
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decodificar JWT para verificar expiração  
      const payload = JSON.parse(atob(token.split('.')[1])); // Separa o payload da estrutura do JWT
      const currentTime = Date.now() / 1000; // Decodifica a string Base64 do payload

      if (payload.exp < currentTime) { //exp = expiration
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      this.logout();
      return false;
    }
  }

  // Login do usuário
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseUrl}/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.saveToken(data.token);
        if (data.user) {
          this.saveUser(data.user);
        }
        return { success: true, data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }

  // Registro de usuário
  async register(name, email, password, confirmPassword) {
    try {
      console.log('Dados para registro:', { 
        name, 
        email, 
        password: '***',
        confirmPassword: '***'
      });

      const response = await fetch(`${this.baseUrl}/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword
        })
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log('Dados da resposta:', data);

      if (response.ok && data.success) {
        return { success: true, data };
      } else {
        return { 
          success: false, 
          message: data.message || data.errors || 'Erro desconhecido'
        };
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro de conexão com o servidor' };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    window.location.href = 'login.html';
  }

  // Obter headers com autorização
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Fazer requisição autenticada
  async authenticatedFetch(url, options = {}) {
    if (!this.isAuthenticated()) {
      this.logout();
      return null;
    }

    const defaultOptions = {
      headers: this.getAuthHeaders()
    };

    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    

    try {
      const response = await fetch(url, mergedOptions);

      if (response.status === 401) {
        this.logout();
        return null;
      }

      return response;
    } catch (error) {
      console.error('Erro na requisição autenticada:', error);
      throw error;
    }
  }

  // Validar token no servidor
  async validateToken() {
    try {
      const response = await this.authenticatedFetch(`${this.baseUrl}/Auth/validate`);
      return response && response.ok;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      return false;
    }
  }

  // Verificar autenticação e redirecionar se necessário
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
}

// Instância global do serviço de autenticação
const authService = new AuthService();

// Exportar para uso em módulos
export default authService;