import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email et mot de passe requis' })
  }

  const db = useDB()

  const [rows] = await db.execute(
    'SELECT IDUtilisateur, motDePasse, Pseudo, email FROM Utilisateur WHERE email = ?',
    [email]
  )

  const users = rows as any[]
  if (users.length === 0) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }

  const user = users[0]
  const valid = await bcrypt.compare(password, user.motDePasse)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })
  }

  await setUserSession(event, {
    user: {
      id: user.IDUtilisateur,
      pseudo: user.Pseudo,
      email: user.email,
    },
  })

  return {
    user: {
      id: user.IDUtilisateur,
      pseudo: user.Pseudo,
      email: user.email,
    },
  }
})
