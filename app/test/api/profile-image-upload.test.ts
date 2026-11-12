/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import type { Express } from 'express'
import config from 'config'
import path from 'node:path'
import fs from 'node:fs'
import { createTestApp } from './helpers/setup'
import { login } from './helpers/auth'

let app: Express

before(async () => {
  const result = await createTestApp()
  app = result.app
}, { timeout: 60000 })

void describe('/profile/image/file', () => {
  void it('POST profile image file valid for JPG format', async () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .attach('file', file)
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST profile image file invalid type', async () => {
    const file = path.resolve(__dirname, '../files/invalidProfileImageType.docx')

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .attach('file', file)

    assert.equal(res.status, 415)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes(`${config.get<string>('application.name')} (Express`))
    assert.ok(res.text.includes('Error: Profile image upload does not accept this file type'))
  })

  void it('POST profile image file forbidden for anonymous user', async () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')

    const res = await request(app)
      .post('/profile/image/file')
      .attach('file', file)

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST profile image file rejected for unrecognizable file content', async () => {
    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .attach('file', Buffer.from('not an image, just plain text content'), 'random.bin')

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('Error: Illegal file type'))
  })
})

void describe('/profile/image/url', () => {
  void it('POST profile image URL from an allowed host and reject redirects', async (t) => {
    t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, options?: RequestInit) => {
      assert.equal(options?.redirect, 'error')
      return new Response(null, { status: 404 })
    })

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://cataas.com/cat')
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST profile image URL redirects even for invalid image URL', async () => {
    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://notanimage.here/100/100')
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST profile image URL forbidden for anonymous user', { skip: 'FIXME runs into "socket hang up"' }, async () => {
    const res = await request(app)
      .post('/profile/image/url')
      .field('imageUrl', 'cataas.com/cat')

    assert.equal(res.status, 500)
    assert.ok(res.headers['content-type']?.includes('text/html'))
    assert.ok(res.text.includes('Error: Blocked illegal activity'))
  })

  void it('POST valid image with tampered content length', async () => {
    const file = path.resolve(__dirname, '../files/validProfileImage.jpg')

    const { token } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })

    const res = await request(app)
      .post('/profile/image/file')
      .set('Cookie', `token=${token}`)
      .set('Content-Length', '42')
      .attach('file', file)
      .redirects(0)

    assert.equal(res.status, 302)
    assert.ok(res.headers.location?.includes('/profile'))
  })
})

void describe('/profile/image/url (mocked fetch)', () => {
  let token: string
  let userId: number
  let imageBuffer: Buffer

  before(async () => {
    const { token: userToken } = await login(app, {
      email: `jim@${config.get<string>('application.domain')}`,
      password: 'ncc-1701'
    })
    token = userToken
    userId = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).data.id

    imageBuffer = fs.readFileSync(path.resolve(__dirname, '../files/validProfileImage.jpg'))
  })

  void it('POST with non-OK response falls back to storing URL as profile image', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 404 }))
    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://cataas.com/non-ok.jpg')
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST with empty-body response (204) falls back to storing URL as profile image', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }))
    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://cataas.com/no-body.jpg')
      .redirects(0)

    assert.equal(res.status, 302)
  })

  void it('POST with valid response writes file and rejects redirects', async (t) => {
    let redirect: string | undefined
    t.mock.method(globalThis, 'fetch', async (_url: string | URL | Request, options?: RequestInit) => {
      redirect = options?.redirect
      return new Response(imageBuffer, { status: 200, headers: { 'Content-Type': 'image/jpeg' } })
    })
    const res = await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://cataas.com/photo.jpg')
      .redirects(0)

    assert.equal(res.status, 302)
    assert.ok(res.headers.location?.endsWith('/profile'))
    assert.equal(redirect, 'error')
  })

  void it('POST with PNG URL extension saves file using PNG extension', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response(imageBuffer, { status: 200 }))
    await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://cataas.com/photo.png')
      .redirects(0)

    assert.ok(
      fs.existsSync(`frontend/dist/frontend/assets/public/images/uploads/${userId}.png`),
      `Expected file frontend/dist/frontend/assets/public/images/uploads/${userId}.png to exist`
    )
  })

  void it('POST with unrecognised URL extension defaults to JPG extension', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response(imageBuffer, { status: 200 }))
    await request(app)
      .post('/profile/image/url')
      .set('Cookie', `token=${token}`)
      .field('imageUrl', 'https://cataas.com/photo.bmp')
      .redirects(0)

    assert.ok(
      fs.existsSync(`frontend/dist/frontend/assets/public/images/uploads/${userId}.jpg`),
      `Expected file frontend/dist/frontend/assets/public/images/uploads/${userId}.jpg to exist`
    )
  })
})
