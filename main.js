// ========================================
// 1️⃣ CONFIGURACIÓN DE SUPABASE
// ========================================
const SUPABASE_URL = "https://otdbuuhddyrjhmgzctsf.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZGJ1dWhkZHlyamhtZ3pjdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MDMwNzUsImV4cCI6MjA3NjM3OTA3NX0.YXXSWbp5Q2GSM3kbEegzyMLCrAXt2dLtJlkdLDSQawE"

// Crear cliente de Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// ========================================
// 2️⃣ ELEMENTOS DEL DOM
// ========================================
const userForm = document.getElementById("userForm")
const usersTable = document.getElementById("usersTable")
const userIdInput = document.getElementById("userId")
const nombreInput = document.getElementById("nombre")
const emailInput = document.getElementById("email")
const cancelEditBtn = document.getElementById("cancelEdit")
const formTitle = document.getElementById("formTitle")
const btnText = document.getElementById("btnText")
const userCount = document.getElementById("userCount")
const connectionStatus = document.getElementById("connectionStatus")

// ========================================
// 3️⃣ VERIFICAR CONEXIÓN
// ========================================
async function verificarConexion() {
  try {
    const { data, error } = await supabase.from("usuarios").select("count")

    if (error) throw error

    connectionStatus.innerHTML = `
            <span class="status-badge status-connected">
                <i class="bi bi-check-circle-fill"></i> Conectado a Supabase
            </span>
        `
    return true
  } catch (error) {
    connectionStatus.innerHTML = `
            <span class="status-badge status-error">
                <i class="bi bi-exclamation-triangle-fill"></i> Error de conexión
            </span>
        `
    console.error("Error de conexión:", error)
    return false
  }
}

// ========================================
// 4️⃣ LISTAR USUARIOS (READ)
// ========================================
async function listarUsuarios() {
  try {
    const { data, error } = await supabase.from("usuarios").select("*").order("id", { ascending: true })

    if (error) throw error

    // Actualizar contador
    userCount.textContent = data.length

    // Renderizar tabla
    if (data.length === 0) {
      usersTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted py-5">
                        <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                        <p class="mt-3">No hay usuarios registrados</p>
                        <small>Agrega tu primer usuario usando el formulario</small>
                    </td>
                </tr>
            `
    } else {
      usersTable.innerHTML = data
        .map(
          (usuario) => `
                <tr>
                    <td><strong>#${usuario.id}</strong></td>
                    <td>
                        <i class="bi bi-person-circle text-primary"></i> 
                        ${usuario.nombre}
                    </td>
                    <td>
                        <i class="bi bi-envelope text-secondary"></i> 
                        ${usuario.email}
                    </td>
                    <td class="text-center">
                        <button 
                            class="btn btn-sm btn-outline-primary me-1" 
                            onclick="editarUsuario(${usuario.id}, '${usuario.nombre}', '${usuario.email}')"
                            title="Editar"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                            class="btn btn-sm btn-outline-danger" 
                            onclick="eliminarUsuario(${usuario.id})"
                            title="Eliminar"
                        >
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `,
        )
        .join("")
    }
  } catch (error) {
    console.error("Error al listar usuarios:", error)
    mostrarNotificacion("Error al cargar usuarios", "danger")
  }
}

// ========================================
// 5️⃣ CREAR O ACTUALIZAR USUARIO (CREATE/UPDATE)
// ========================================
userForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const nombre = nombreInput.value.trim()
  const email = emailInput.value.trim()
  const id = userIdInput.value

  try {
    if (id) {
      // ACTUALIZAR usuario existente
      const { error } = await supabase.from("usuarios").update({ nombre, email }).eq("id", id)

      if (error) throw error
      mostrarNotificacion("Usuario actualizado correctamente", "success")
    } else {
      // CREAR nuevo usuario
      const { error } = await supabase.from("usuarios").insert([{ nombre, email }])

      if (error) throw error
      mostrarNotificacion("Usuario creado correctamente", "success")
    }

    // Limpiar formulario
    resetearFormulario()
  } catch (error) {
    console.error("Error al guardar usuario:", error)
    mostrarNotificacion("Error al guardar usuario", "danger")
  }
})

// ========================================
// 6️⃣ EDITAR USUARIO
// ========================================
window.editarUsuario = (id, nombre, email) => {
  userIdInput.value = id
  nombreInput.value = nombre
  emailInput.value = email

  // Cambiar UI a modo edición
  formTitle.innerHTML = '<i class="bi bi-pencil-square"></i> Editar Usuario'
  btnText.textContent = "Actualizar Usuario"
  cancelEditBtn.classList.remove("d-none")

  // Scroll al formulario en móvil
  if (window.innerWidth < 992) {
    document.querySelector(".form-section").scrollIntoView({ behavior: "smooth" })
  }
}

// ========================================
// 7️⃣ CANCELAR EDICIÓN
// ========================================
cancelEditBtn.addEventListener("click", resetearFormulario)

function resetearFormulario() {
  userForm.reset()
  userIdInput.value = ""
  formTitle.innerHTML = '<i class="bi bi-person-plus-fill"></i> Agregar Usuario'
  btnText.textContent = "Guardar Usuario"
  cancelEditBtn.classList.add("d-none")
}

// ========================================
// 8️⃣ ELIMINAR USUARIO (DELETE)
// ========================================
window.eliminarUsuario = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este usuario?")) return

  try {
    const { error } = await supabase.from("usuarios").delete().eq("id", id)

    if (error) throw error
    mostrarNotificacion("Usuario eliminado correctamente", "success")
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    mostrarNotificacion("Error al eliminar usuario", "danger")
  }
}

// ========================================
// 9️⃣ TIEMPO REAL (REALTIME)
// ========================================
supabase
  .channel("usuarios-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "usuarios",
    },
    (payload) => {
      console.log("Cambio detectado:", payload)
      listarUsuarios() // Actualizar lista automáticamente
    },
  )
  .subscribe()

// ========================================
// 🔟 NOTIFICACIONES
// ========================================
function mostrarNotificacion(mensaje, tipo = "info") {
  const alertDiv = document.createElement("div")
  alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`
  alertDiv.style.zIndex = "9999"
  alertDiv.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `
  document.body.appendChild(alertDiv)

  setTimeout(() => alertDiv.remove(), 3000)
}

// ========================================
// 1️⃣1️⃣ INICIALIZACIÓN
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Iniciando aplicación CRUD...")

  // Verificar conexión
  const conectado = await verificarConexion()

  if (conectado) {
    // Cargar usuarios
    await listarUsuarios()
    console.log("✅ Aplicación lista")
  } else {
    console.error("❌ No se pudo conectar a Supabase")
  }
})
