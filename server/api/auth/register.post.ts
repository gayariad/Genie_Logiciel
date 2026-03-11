import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { pseudo, email, password } = body

  if (!pseudo || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Pseudo, email et mot de passe requis' })
  }

  if (password.length < 4 || password.length > 30) {
    throw createError({ statusCode: 400, statusMessage: 'Le mot de passe doit faire entre 4 et 30 caractères' })
  }

  const db = useDB()

  // Vérifier si l'email existe déjà
  const [existing] = await db.execute('SELECT IDUtilisateur FROM Utilisateur WHERE email = ?', [email])
  if ((existing as any[]).length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Cet email est déjà utilisé' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const [result] = await db.execute(
    'INSERT INTO Utilisateur (motDePasse, Pseudo, email) VALUES (?, ?, ?)',
    [hashedPassword, pseudo, email]
  )

  const userId = (result as any).insertId

  // Créer la session
  await setUserSession(event, {
    user: {
      id: userId,
      pseudo,
      email,
    },
  })

  return { user: { id: userId, pseudo, email } }
})
