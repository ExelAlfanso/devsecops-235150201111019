/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { after, before, describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import http from 'node:http'
import { type AddressInfo } from 'node:net'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'

let app: Express
let token: string
let mockServer: http.Server
let mockPort: number
let internalRequests: string[] = []

before(async () => {
  const result = await createTestApp()
  app = result.app
  const session = await login(app, {
    email: `jim@${config.get<string>('application.domain')}`,
    password: 'ncc-1701'
  })
  token = session.token

  mockServer = http.createServer((req, res) => {
    internalRequests.push(req.url ?? '')
    res.statusCode = 204
    res.end()
  })
  await new Promise<void>((resolve, reject) => {
    mockServer.once('error', reject)
    mockServer.listen(0, '127.0.0.1', resolve)
  })
  mockPort = (mockServer.address() as AddressInfo).port
}, { timeout: 60000 })

after(async () => {
  await new Promise<void>((resolve, reject) => {
    mockServer.close((error) => { error != null ? reject(error) : resolve() })
  })
})

void describe('Regresi SSRF: URL profil tidak boleh mengakses loopback (ds-235150201111019)', () => {
  void it('menolak request server-side ke endpoint loopback', async () => {
    internalRequests = []
    const imageUrl = `http://127.0.0.1:${mockPort}/solve/challenges/server-side?key=tRy_H4rd3r_n0thIng_iS_Imp0ssibl3&wm=ds-235150201111019`

    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', imageUrl)
      .redirects(0)

    assert.equal(res.status, 302)
    assert.deepEqual(internalRequests, [], 'server mengirim request ke alamat loopback')
  })
})
