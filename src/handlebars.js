'use strict'

const fs = require('fs')
const { promisify } = require('util')
const path = require('path')
const readFile = promisify(fs.readFile)
const handlebars = require('handlebars')

function registerHandlebarHelpers(config) {
  const { commitMessageLines } = config
  handlebars.registerHelper('commitMessage', function (content) {
    if (!commitMessageLines || commitMessageLines < 0) {
      return content
    }
    return content.split('\n').slice(0, commitMessageLines).join('\n').trim()
  })
  handlebars.registerHelper('substring', function (content, characters) {
    return (content || '').substring(0, characters)
  })
}

async function renderIssueBody(data) {
  const templateFilePath = path.resolve(__dirname, 'issue.template.hbs')
  const templateStringBuffer = await readFile(templateFilePath)
  const template = handlebars.compile(templateStringBuffer.toString())
  return template(data)
}

module.exports = {
  registerHandlebarHelpers,
  renderIssueBody,
}
