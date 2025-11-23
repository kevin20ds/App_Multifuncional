// SQLite Database Simulation (in-memory for web)
const DB = {
  users: [],
  tasks: [],
  
  init() {
    // Initialize database tables
    console.log('Database initialized');
  },
  
  query(table, condition = null) {
    if (condition) {
      return this[table].filter(condition);
    }
    return this[table];
  },
  
  insert(table, data) {
    this[table].push(data);
    return data;
  },
  
  update(table, id, data) {
    const index = this[table].findIndex(item => item.id === id);
    if (index !== -1) {
      this[table][index] = { ...this[table][index], ...data };
      return this[table][index];
    }
    return null;
  },
  
  delete(table, id) {
    const index = this[table].findIndex(item => item.id === id);
    if (index !== -1) {
      this[table].splice(index, 1);
      return true;
    }
    return false;
  }
};

// Context API - Global User State
const UserContext = {
  currentUser: null,
  
  setUser(user) {
    this.currentUser = user;
  },
  
  getUser() {
    return this.currentUser;
  },
  
  clearUser() {
    this.currentUser = null;
  },
  
  isLoggedIn() {
    return this.currentUser !== null;
  }
};

// State management
const state = {
  currentScreen: 'home',
  editingTaskId: null
};

// Initialize database
DB.init();

// Navigation
function navigate(screenName) {
  state.currentScreen = screenName;
  render();
}

// Validation functions
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^\d+$/;
  return phoneRegex.test(phone);
}

function validatePassword(password) {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  if (password.length < 6) {
    return { valid: false, message: 'Senha deve ter no mínimo 6 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos uma letra maiúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos uma letra minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Senha deve conter ao menos um número' };
  }
  return { valid: true };
}

// User Management
function registerUser(name, email, phone, password) {
  if (!name || !email || !phone || !password) {
    return { success: false, message: 'Todos os campos são obrigatórios' };
  }
  
  if (!validateEmail(email)) {
    return { success: false, message: 'Email inválido' };
  }
  
  if (!validatePhone(phone)) {
    return { success: false, message: 'Telefone deve conter apenas números' };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { success: false, message: passwordValidation.message };
  }
  
  const userExists = DB.query('users', u => u.email === email);
  if (userExists.length > 0) {
    return { success: false, message: 'Email já cadastrado' };
  }
  
  const user = {
    id: Date.now(),
    name,
    email,
    phone,
    password
  };
  
  DB.insert('users', user);
  UserContext.setUser({ id: user.id, name: user.name, email: user.email, phone: user.phone });
  
  return { success: true, message: 'Usuário cadastrado com sucesso!' };
}

function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, message: 'Email e senha são obrigatórios' };
  }
  
  const users = DB.query('users', u => u.email === email && u.password === password);
  if (users.length === 0) {
    return { success: false, message: 'Email ou senha incorretos' };
  }
  
  const user = users[0];
  UserContext.setUser({ id: user.id, name: user.name, email: user.email, phone: user.phone });
  
  return { success: true, message: 'Login realizado com sucesso!' };
}

function resetPassword(email) {
  if (!email) {
    return { success: false, message: 'Email é obrigatório' };
  }
  
  const users = DB.query('users', u => u.email === email);
  if (users.length === 0) {
    return { success: false, message: 'Email não encontrado' };
  }
  
  return { success: true, message: 'Email de redefinição enviado com sucesso!' };
}

// Update User
function updateUser(name, email, phone, newPassword, currentPassword) {
  const currentUser = UserContext.getUser();
  
  if (!currentUser) {
    return { success: false, message: 'Usuário não está logado' };
  }
  
  if (!name || !email || !phone || !currentPassword) {
    return { success: false, message: 'Nome, email, telefone e senha atual são obrigatórios' };
  }
  
  if (name.trim() === '') {
    return { success: false, message: 'Nome não pode estar vazio' };
  }
  
  if (!validateEmail(email)) {
    return { success: false, message: 'Email inválido' };
  }
  
  if (!validatePhone(phone)) {
    return { success: false, message: 'Telefone deve conter apenas números' };
  }
  
  // Verify current password
  const users = DB.query('users', u => u.id === currentUser.id);
  if (users.length === 0 || users[0].password !== currentPassword) {
    return { success: false, message: 'Senha atual incorreta' };
  }
  
  // Check if new email is already taken by another user
  if (email !== currentUser.email) {
    const emailExists = DB.query('users', u => u.email === email && u.id !== currentUser.id);
    if (emailExists.length > 0) {
      return { success: false, message: 'Email já está sendo usado por outro usuário' };
    }
  }
  
  // Validate new password if provided
  let finalPassword = users[0].password;
  if (newPassword && newPassword.trim() !== '') {
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }
    finalPassword = newPassword;
  }
  
  // Update user in database
  const updatedUser = DB.update('users', currentUser.id, {
    name,
    email,
    phone,
    password: finalPassword
  });
  
  if (!updatedUser) {
    return { success: false, message: 'Erro ao atualizar usuário' };
  }
  
  // Update context
  UserContext.setUser({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, phone: updatedUser.phone });
  
  return { success: true, message: 'Dados atualizados com sucesso!' };
}

// IMC Calculation
function calculateIMC(height, weight) {
  if (!height || !weight || height <= 0 || weight <= 0) {
    return { success: false, message: 'Altura e peso devem ser valores válidos' };
  }
  
  const imc = weight / (height * height);
  let classification = '';
  
  if (imc < 18.5) classification = 'Abaixo do peso';
  else if (imc < 25) classification = 'Peso normal';
  else if (imc < 30) classification = 'Sobrepeso';
  else if (imc < 35) classification = 'Obesidade grau I';
  else if (imc < 40) classification = 'Obesidade grau II';
  else classification = 'Obesidade grau III';
  
  return { 
    success: true, 
    imc: imc.toFixed(2), 
    classification 
  };
}

// Task Management
function addTask(name, date) {
  if (!name || !date) {
    return { success: false, message: 'Nome e data são obrigatórios' };
  }
  
  const task = {
    id: Date.now(),
    name,
    date
  };
  
  DB.insert('tasks', task);
  return { success: true, message: 'Tarefa adicionada com sucesso!' };
}

function updateTask(id, name, date) {
  if (!name || !date) {
    return { success: false, message: 'Nome e data são obrigatórios' };
  }
  
  const updated = DB.update('tasks', id, { name, date });
  if (!updated) {
    return { success: false, message: 'Tarefa não encontrada' };
  }
  
  state.editingTaskId = null;
  return { success: true, message: 'Tarefa atualizada com sucesso!' };
}

function deleteTask(id) {
  DB.delete('tasks', id);
  render();
}

function startEditTask(id) {
  state.editingTaskId = id;
  render();
}

function cancelEditTask() {
  state.editingTaskId = null;
  render();
}

// Render functions
function renderHome() {
  const isLoggedIn = UserContext.isLoggedIn();
  const user = UserContext.getUser();
  
  const userGreeting = isLoggedIn ? `
    <div style="background: var(--color-bg-1); border: 2px solid var(--color-primary); border-radius: var(--radius-lg); padding: var(--space-16); margin-bottom: var(--space-24); box-shadow: 0 4px 12px rgba(33, 128, 141, 0.15);">
      <div style="font-size: var(--font-size-lg); font-weight: var(--font-weight-semibold); color: var(--color-text); margin-bottom: var(--space-4);">Olá, ${user.name}! 👋</div>
      <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${user.email}</div>
    </div>
  ` : '';
  
  const editUserButton = `
    <button class="home-button" onclick="navigate('editUser')" style="border-color: #f39c12;">
      <div class="home-button-icon" style="filter: hue-rotate(20deg);">✏️</div>
      <div class="home-button-text">Alterar Usuário</div>
    </button>
  `;
  
  return `
    <div class="screen active" id="home">
      <div class="header">
        <h1>🎯 Aplicativo Multi-Funcional</h1>
      </div>
      <div class="content">
        ${userGreeting}
        <div class="home-grid">
          <button class="home-button" onclick="navigate('register')">
            <div class="home-button-icon">👤</div>
            <div class="home-button-text">Cadastro</div>
          </button>
          <button class="home-button" onclick="navigate('imc')">
            <div class="home-button-icon">⚖️</div>
            <div class="home-button-text">Calcular IMC</div>
          </button>
          <button class="home-button" onclick="navigate('tasks')">
            <div class="home-button-icon">✅</div>
            <div class="home-button-text">Lista de Tarefas</div>
          </button>
          <button class="home-button" onclick="navigate('about')">
            <div class="home-button-icon">📱</div>
            <div class="home-button-text">Sobre o App</div>
          </button>
          ${editUserButton}
        </div>
      </div>
    </div>
  `;
}

function renderRegister() {
  return `
    <div class="screen active" id="register">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Cadastro</h1>
      </div>
      <div class="content">
        <div id="register-alert"></div>
        <form onsubmit="handleRegister(event)">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="register-name" placeholder="Digite seu nome" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="register-email" placeholder="Digite seu email" required>
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input type="tel" class="form-input" id="register-phone" placeholder="Digite seu telefone" required>
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" class="form-input" id="register-password" placeholder="Digite sua senha" required>
          </div>
          <button type="submit" class="btn btn-primary">Cadastrar</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('login')">Já tenho conta - Fazer Login</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('reset')">Esqueci minha senha</button>
        </form>
      </div>
    </div>
  `;
}

function renderLogin() {
  return `
    <div class="screen active" id="login">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Login</h1>
      </div>
      <div class="content">
        <div id="login-alert"></div>
        <form onsubmit="handleLogin(event)">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="login-email" placeholder="Digite seu email" required>
          </div>
          <div class="form-group">
            <label class="form-label">Senha</label>
            <input type="password" class="form-input" id="login-password" placeholder="Digite sua senha" required>
          </div>
          <button type="submit" class="btn btn-primary">Entrar</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('register')">Criar nova conta</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('reset')">Esqueci minha senha</button>
        </form>
      </div>
    </div>
  `;
}

function renderReset() {
  return `
    <div class="screen active" id="reset">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Redefinir Senha</h1>
      </div>
      <div class="content">
        <div id="reset-alert"></div>
        <form onsubmit="handleReset(event)">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="reset-email" placeholder="Digite seu email" required>
          </div>
          <button type="submit" class="btn btn-primary">Enviar Email de Redefinição</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('login')">Voltar para Login</button>
        </form>
      </div>
    </div>
  `;
}

function renderIMC() {
  return `
    <div class="screen active" id="imc">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Calcular IMC</h1>
      </div>
      <div class="content">
        <div id="imc-alert"></div>
        <form onsubmit="handleIMC(event)">
          <div class="form-group">
            <label class="form-label">Altura (em metros)</label>
            <input type="number" step="0.01" class="form-input" id="imc-height" placeholder="Ex: 1.75" required>
          </div>
          <div class="form-group">
            <label class="form-label">Peso (em kg)</label>
            <input type="number" step="0.1" class="form-input" id="imc-weight" placeholder="Ex: 70" required>
          </div>
          <button type="submit" class="btn btn-primary">Calcular IMC</button>
        </form>
        <div id="imc-result"></div>
      </div>
    </div>
  `;
}

function renderEditUser() {
  const user = UserContext.getUser();
  
  if (!user) {
    return `
      <div class="screen active" id="editUser">
        <div class="header">
          <button class="back-button" onclick="navigate('home')">←</button>
          <h1>Alterar Usuário</h1>
        </div>
        <div class="content">
          <div class="alert alert-error">Você precisa estar logado para acessar esta página</div>
          <button class="btn btn-primary" onclick="navigate('login')">Fazer Login</button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="screen active" id="editUser">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Alterar Usuário</h1>
      </div>
      <div class="content">
        <div id="edituser-alert"></div>
        <form onsubmit="handleEditUser(event)">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" id="edituser-name" placeholder="${user.name}" value="${user.name}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-input" id="edituser-email" placeholder="${user.email}" value="${user.email}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input type="tel" class="form-input" id="edituser-phone" placeholder="${user.phone}" value="${user.phone}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Nova Senha (opcional)</label>
            <input type="password" class="form-input" id="edituser-newpassword" placeholder="Deixe em branco para não alterar">
            <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-4);">Mínimo 6 caracteres, 1 maiúscula, 1 minúscula, 1 número</div>
          </div>
          <div class="form-group">
            <label class="form-label">Senha Atual (obrigatória) *</label>
            <input type="password" class="form-input" id="edituser-currentpassword" placeholder="Digite sua senha atual para confirmar" required>
          </div>
          <button type="submit" class="btn btn-primary" style="background: #f39c12; box-shadow: 0 4px 12px rgba(243, 156, 18, 0.25);" onmouseover="this.style.background='#e67e22'" onmouseout="this.style.background='#f39c12'">Salvar Alterações</button>
          <button type="button" class="btn btn-secondary" onclick="navigate('home')">Cancelar</button>
        </form>
      </div>
    </div>
  `;
}

function renderTasks() {
  const tasks = DB.query('tasks');
  const tasksHTML = tasks.length === 0 
    ? '<div class="empty-state">Nenhuma tarefa cadastrada</div>'
    : tasks.map(task => {
        const isEditing = state.editingTaskId === task.id;
        if (isEditing) {
          return `
            <div class="task-item">
              <div class="form-group">
                <label class="form-label">Nome da Tarefa</label>
                <input type="text" class="form-input" id="edit-task-name-${task.id}" value="${task.name}">
              </div>
              <div class="form-group">
                <label class="form-label">Data de Entrega</label>
                <input type="date" class="form-input" id="edit-task-date-${task.id}" value="${task.date}">
              </div>
              <div class="task-actions">
                <button class="btn btn-primary" onclick="handleUpdateTask(${task.id})">Salvar</button>
                <button class="btn btn-secondary" onclick="cancelEditTask()">Cancelar</button>
              </div>
            </div>
          `;
        }
        return `
          <div class="task-item">
            <div class="task-info">
              <div class="task-name">${task.name}</div>
              <div class="task-date">Data de entrega: ${new Date(task.date).toLocaleDateString('pt-BR')}</div>
            </div>
            <div class="task-actions">
              <button class="btn btn-secondary" onclick="startEditTask(${task.id})">Editar</button>
              <button class="btn btn-danger" onclick="deleteTask(${task.id})">Excluir</button>
            </div>
          </div>
        `;
      }).join('');

  return `
    <div class="screen active" id="tasks">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Lista de Tarefas</h1>
      </div>
      <div class="content">
        <div class="task-add-area">
          <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--space-16); font-weight: var(--font-weight-semibold);">Adicionar Nova Tarefa</h2>
          <div id="task-alert"></div>
          <form onsubmit="handleAddTask(event)">
            <div class="form-group">
              <label class="form-label">Nome da Tarefa</label>
              <input type="text" class="form-input" id="task-name" placeholder="Digite o nome da tarefa" required>
            </div>
            <div class="form-group">
              <label class="form-label">Data de Entrega</label>
              <input type="date" class="form-input" id="task-date" required>
            </div>
            <button type="submit" class="btn btn-primary">Salvar Tarefa</button>
          </form>
        </div>
        <div class="task-list-area">
          <h2 style="font-size: var(--font-size-xl); margin-bottom: var(--space-16); font-weight: var(--font-weight-semibold);">Tarefas Salvas</h2>
          ${tasksHTML}
        </div>
      </div>
    </div>
  `;
}

function renderAbout() {
  return `
    <div class="screen active" id="about">
      <div class="header">
        <button class="back-button" onclick="navigate('home')">←</button>
        <h1>Sobre</h1>
      </div>
      <div class="content">
        <div class="about-section">
          <h2>Sobre o Aplicativo</h2>
          <p>Este é um aplicativo multi-funcional desenvolvido para demonstrar diversas funcionalidades em uma única plataforma.</p>
        </div>

        <div class="about-section">
          <h2>Funcionalidades</h2>
          <ul>
            <li><strong>Sistema de Cadastro e Login:</strong> Permite criar uma conta, fazer login e redefinir senha de forma simulada.</li>
            <li><strong>Calculadora de IMC:</strong> Calcula o Índice de Massa Corporal com base na altura e peso informados, fornecendo a classificação correspondente.</li>
            <li><strong>Lista de Tarefas:</strong> Gerenciador completo de tarefas com funcionalidades de adicionar, editar e excluir tarefas, incluindo datas de entrega.</li>
          </ul>
        </div>

        <div class="about-section">
          <h2>Como Usar</h2>
          <p><strong>Cadastro e Login:</strong></p>
          <ul>
            <li>Na tela inicial, clique em "Cadastro"</li>
            <li>Preencha todos os campos obrigatórios (nome, email, telefone e senha)</li>
            <li>Clique em "Cadastrar" para criar sua conta</li>
            <li>Use "Já tenho conta" para fazer login com credenciais existentes</li>
            <li>Use "Esqueci minha senha" para simular redefinição de senha</li>
          </ul>

          <p><strong>Calculadora de IMC:</strong></p>
          <ul>
            <li>Digite sua altura em metros (ex: 1.75)</li>
            <li>Digite seu peso em quilogramas (ex: 70)</li>
            <li>Clique em "Calcular IMC" para ver o resultado e classificação</li>
          </ul>

          <p><strong>Lista de Tarefas:</strong></p>
          <ul>
            <li>Na área "Adicionar Nova Tarefa", digite o nome da tarefa</li>
            <li>Selecione uma data de entrega</li>
            <li>Clique em "Salvar Tarefa" para adicionar</li>
            <li>Na área "Tarefas Salvas", você pode editar ou excluir tarefas existentes</li>
            <li>Ao editar, clique em "Salvar" para confirmar ou "Cancelar" para descartar</li>
          </ul>
        </div>

        <div class="about-section">
          <h2>Navegação</h2>
          <p>Use o botão de voltar (←) no topo de cada tela para retornar à tela anterior ou à página inicial. Todas as telas são acessíveis através do menu principal na Home.</p>
        </div>

        <div class="about-section">
          <h2>Kevin de Souza</h2>
        </div>
      </div>
    </div>
  `;
}

// Event handlers
function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const phone = document.getElementById('register-phone').value;
  const password = document.getElementById('register-password').value;
  
  const result = registerUser(name, email, phone, password);
  const alertDiv = document.getElementById('register-alert');
  
  if (result.success) {
    alertDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
    setTimeout(() => navigate('home'), 1500);
  } else {
    alertDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
  }
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  const result = loginUser(email, password);
  const alertDiv = document.getElementById('login-alert');
  
  if (result.success) {
    alertDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
    setTimeout(() => navigate('home'), 1500);
  } else {
    alertDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
  }
}

function handleReset(event) {
  event.preventDefault();
  const email = document.getElementById('reset-email').value;
  
  const result = resetPassword(email);
  const alertDiv = document.getElementById('reset-alert');
  
  if (result.success) {
    alertDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
    document.getElementById('reset-email').value = '';
  } else {
    alertDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
  }
}

function handleIMC(event) {
  event.preventDefault();
  const height = parseFloat(document.getElementById('imc-height').value);
  const weight = parseFloat(document.getElementById('imc-weight').value);
  
  const result = calculateIMC(height, weight);
  const alertDiv = document.getElementById('imc-alert');
  const resultDiv = document.getElementById('imc-result');
  
  if (result.success) {
    alertDiv.innerHTML = '';
    resultDiv.innerHTML = `
      <div class="result-box">
        <div class="result-label">Seu IMC é:</div>
        <div class="result-value">${result.imc}</div>
        <div class="result-label" style="margin-top: var(--space-12); font-size: var(--font-size-lg);">${result.classification}</div>
      </div>
    `;
  } else {
    alertDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
    resultDiv.innerHTML = '';
  }
}

function handleAddTask(event) {
  event.preventDefault();
  const name = document.getElementById('task-name').value;
  const date = document.getElementById('task-date').value;
  
  const result = addTask(name, date);
  const alertDiv = document.getElementById('task-alert');
  
  if (result.success) {
    alertDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
    document.getElementById('task-name').value = '';
    document.getElementById('task-date').value = '';
    setTimeout(() => {
      alertDiv.innerHTML = '';
      render();
    }, 1500);
  } else {
    alertDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
  }
}

function handleUpdateTask(id) {
  const name = document.getElementById(`edit-task-name-${id}`).value;
  const date = document.getElementById(`edit-task-date-${id}`).value;
  
  const result = updateTask(id, name, date);
  if (result.success) {
    render();
  }
}

function handleEditUser(event) {
  event.preventDefault();
  const name = document.getElementById('edituser-name').value;
  const email = document.getElementById('edituser-email').value;
  const phone = document.getElementById('edituser-phone').value;
  const newPassword = document.getElementById('edituser-newpassword').value;
  const currentPassword = document.getElementById('edituser-currentpassword').value;
  
  const result = updateUser(name, email, phone, newPassword, currentPassword);
  const alertDiv = document.getElementById('edituser-alert');
  
  if (result.success) {
    alertDiv.innerHTML = `<div class="alert alert-success">${result.message}</div>`;
    setTimeout(() => navigate('home'), 1500);
  } else {
    alertDiv.innerHTML = `<div class="alert alert-error">${result.message}</div>`;
  }
}

// Main render function
function render() {
  const app = document.getElementById('app');
  
  let content = '';
  switch (state.currentScreen) {
    case 'home':
      content = renderHome();
      break;
    case 'register':
      content = renderRegister();
      break;
    case 'login':
      content = renderLogin();
      break;
    case 'reset':
      content = renderReset();
      break;
    case 'imc':
      content = renderIMC();
      break;
    case 'tasks':
      content = renderTasks();
      break;
    case 'about':
      content = renderAbout();
      break;
    case 'editUser':
      content = renderEditUser();
      break;
    default:
      content = renderHome();
  }
  
  app.innerHTML = content;
}

// Initialize app
render();