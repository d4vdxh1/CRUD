document.addEventListener('DOMContentLoaded', () => {
  // Todo tu código de main.js dentro de esta función
  
  // Conexión a Supabase
  const supabaseUrl = 'https://otdbuuhddyrjhmgzctsf.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZGJ1dWhkZHlyamhtZ3pjdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDMwNzUsImV4cCI6MjA3NjM3OTA3NX0.YXXSWbp5Q2GSM3kbEegzyMLCrAXt2dLtJlkdLDSQawE'
  const supabase = supabase.createClient
    ? supabase.createClient(supabaseUrl, supabaseKey)  // si el CDN expone "supabase"
    : Supabase.createClient(supabaseUrl, supabaseKey)  // si el CDN expone "Supabase"
  
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
})
