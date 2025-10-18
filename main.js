// Conexión a Supabase
const supabaseUrl = 'TU_SUPABASE_URL'
const supabaseKey = 'TU_SUPABASE_ANON_KEY'
const supabase = supabase.createClient(supabaseUrl, supabaseKey)

// Elementos del DOM
const userForm = document.getElementById('userForm')
const usersTable = document.getElementById('usersTable')
const cancelEdit = document.getElementById('cancelEdit')

// Función para cargar usuarios
async function loadUsers() {
  const { data, error } = await supabase.from('usuarios').select('*')
  if (error) return console.error(error)

  usersTable.innerHTML = ''
  data.forEach(user => {
    const row = document.createElement('tr')
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.nombre}</td>
      <td>${user.email}</td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="editUser(${user.id}, '${user.nombre}', '${user.email}')">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Eliminar</button>
      </td>
    `
    usersTable.appendChild(row)
  })
}

// Agregar o actualizar usuario
userForm.addEventListener('submit', async e => {
  e.preventDefault()
  const id = document.getElementById('userId').value
  const nombre = document.getElementById('name').value
  const email = document.getElementById('email').value

  if (id) {
    // Actualizar
    const { error } = await supabase.from('usuarios')
      .update({ nombre, email })
      .eq('id', id)
    if (error) console.error(error)
  } else {
    // Agregar
    const { error } = await supabase.from('usuarios')
      .insert([{ nombre, email }])
    if (error) console.error(error)
  }

  userForm.reset()
  document.getElementById('userId').value = ''
  loadUsers()
})

// Editar usuario
window.editUser = (id, nombre, email) => {
  document.getElementById('userId').value = id
  document.getElementById('name').value = nombre
  document.getElementById('email').value = email
}

// Cancelar edición
cancelEdit.addEventListener('click', () => {
  userForm.reset()
  document.getElementById('userId').value = ''
})

// Eliminar usuario
window.deleteUser = async (id) => {
  if (confirm('¿Eliminar este usuario?')) {
    const { error } = await supabase.from('usuarios').delete().eq('id', id)
    if (error) console.error(error)
    loadUsers()
  }
}

// Cargar usuarios al iniciar
loadUsers()
