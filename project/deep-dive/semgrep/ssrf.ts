import { type Request } from 'express'

async function profileImage (req: Request) {
  const url = req.body.imageUrl
  // ruleid: ds-235150201111019-ssrf
  return await fetch(url)
}

async function directInput (req: Request) {
  // ruleid: ds-235150201111019-ssrf
  return await fetch(req.body.imageUrl)
}

async function renamedInput (request: Request) {
  const target = request.body.avatarUrl
  const destination = target
  // ruleid: ds-235150201111019-ssrf
  return await fetch(destination, { redirect: 'follow' })
}

async function fixedDestination () {
  // ok: ds-235150201111019-ssrf
  return await fetch('https://example.com/avatar.png')
}

async function inputInBodyOnly (req: Request) {
  // ok: ds-235150201111019-ssrf
  return await fetch('https://example.com/avatar', { method: 'POST', body: req.body.imageUrl })
}

async function replacedInput (req: Request) {
  let url = req.body.imageUrl
  url = 'https://example.com/avatar.png'
  // ok: ds-235150201111019-ssrf
  return await fetch(url)
}
