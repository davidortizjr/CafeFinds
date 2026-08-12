import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

const router = Router()

// Toggle the checklist state for a cafe. Idempotent create/delete pair
// keyed on the (userId, cafeId) unique constraint.
router.post('/toggle', async (req, res, next) => {
  try {
    const { cafeId } = req.body
    if (!cafeId) return res.status(400).json({ error: 'cafeId is required' })

    const existing = await prisma.visit.findUnique({
      where: { userId_cafeId: { userId: req.user.id, cafeId } }
    })

    if (existing) {
      await prisma.visit.delete({ where: { id: existing.id } })
      return res.json({ visited: false })
    }

    await prisma.visit.create({ data: { userId: req.user.id, cafeId } })
    res.json({ visited: true })
  } catch (err) {
    next(err)
  }
})

export default router
