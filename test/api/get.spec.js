/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
/* globals apiClients */

'use strict'

const expect = require('chai').expect
const isNode = require('detect-node')
const fs = require('fs')
// const bl = require('bl')
const concat = require('concat-stream')
const through = require('through2')
const streamEqual = require('stream-equal')

const path = require('path')

// const extract = require('tar-stream').extract

const testfile = fs.readFileSync(path.join(__dirname, '/../testfile.txt'))
let testfileBig

if (isNode) {
  testfileBig = fs.createReadStream(path.join(__dirname, '/../15mb.random'), { bufferSize: 128 })
}

describe.skip('.get', () => {
  it('get with no compression args', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', (err, res) => {
        expect(err).to.not.exist

        // accumulate the files and their content
        var files = []
        res.pipe(through.obj((file, enc, next) => {
          file.content.pipe(concat((content) => {
            files.push({
              path: file.path,
              content: content
            })
            next()
          }))
        }, () => {
          expect(files).to.be.length(1)
          expect(files[0].content.toString()).to.contain(testfile.toString())
          done()
        }))
      })
  })

  it('get with archive true', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {archive: true}, (err, res) => {
        expect(err).to.not.exist

        // accumulate the files and their content
        var files = []
        res.pipe(through.obj((file, enc, next) => {
          file.content.pipe(concat((content) => {
            files.push({
              path: file.path,
              content: content
            })
            next()
          }))
        }, () => {
          expect(files).to.be.length(1)
          expect(files[0].content.toString()).to.contain(testfile.toString())
          done()
        }))
      })
  })

  it('get err with out of range compression level', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {compress: true, 'compression-level': 10}, (err, res) => {
        expect(err).to.exist
        expect(err.toString()).to.equal('Error: Compression level must be between 1 and 9')
        done()
      })
  })

  it('get with compression level', (done) => {
    apiClients.a
      .get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP', {compress: true, 'compression-level': 1}, (err, res) => {
        expect(err).to.not.exist
        done()
      })
  })

  it('get BIG file', (done) => {
    if (!isNode) {
      return done()
    }

    apiClients.a.get('Qme79tX2bViL26vNjPsF3DP1R9rMKMvnPYJiKTTKPrXJjq', (err, res) => {
      expect(err).to.not.exist

      // Do not blow out the memory of nodejs :)
      streamEqual(res, testfileBig, (err, equal) => {
        expect(err).to.not.exist
        expect(equal).to.be.true
        done()
      })
    })
  })

  describe.skip('promise', () => {
    it('get', (done) => {
      apiClients.a.get('Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP')
        .then((res) => {
          let buf = ''
          res
            .on('error', (err) => {
              throw err
            })
            .on('data', (data) => {
              buf += data
            })
            .on('end', () => {
              expect(buf).to.contain(testfile.toString())
              done()
            })
        })
    })
  })
})
