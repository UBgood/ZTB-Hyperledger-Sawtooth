'use strict'

const $ = require('jquery')

// Add select option which may be set to selected
const addOption = (parent, value, selected = false) => {
  const selectTag = selected ? ' selected' : ''
  $(parent).append(`<option value="${value}"${selectTag}>${value}</option>`)
}

// Add a new table row with any number of cells
const addRow = (parent, ...cells) => {
  const tds = cells.map(cell => `<td>${cell}</td>`).join('')
  $(parent).append(`<tr>${tds}</tr>`)
}

// Add div with accept/reject buttons
const addAction = (parent, label, action) => {
  $(parent).append(`<div>
  <span>${label}</span>
  <input class="accept" type="button" value="Accept">
  <input class="reject" type="button" value="Reject">
</div>`)
}


module.exports = {
  addOption,
  addRow,
  addAction, 
  addBootstrap
}
