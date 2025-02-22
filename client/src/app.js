'use strict'

const $ = require('jquery')
const {
  getKeys,
  makeKeyPair,
  saveKeys,
  getState,
  submitUpdate
} = require('./state')
const {
  addOption,
  addRow,
  addAction
} = require('./components')

var count = 0

const concatNewOwners = (existing, ownerContainers) => {
  return existing.concat(ownerContainers
    .filter(({ owner }) => !existing.includes(owner))
    .map(({ owner }) => owner))
}

// Application Object
const app = { user: null, keys: [], assets: [], transfers: [] }

app.refresh = function () {
  getState(({ assets, transfers }) => {
    this.assets = assets
    this.transfers = transfers

    // Clear existing data views
    $('#assetList').empty()
    $('#transferList').empty()
    $('[name="assetSelect"]').children().slice(1).remove()
    $('[name="transferSelect"]').children().slice(1).remove()

    // Populate asset views
    assets.forEach(asset => {
      addRow('#assetList', asset.name, asset.owner)
      if (this.user && asset.owner === this.user.public) {
        addOption('[name="assetSelect"]', asset.name)
      }
    })

    // Populate transfer list for selected user
    transfers.filter(transfer => transfer.owner === this.user.public)
      .forEach(transfer => addAction('#transferList', transfer.asset, 'Accept'))

    // Populate transfer select with both local and blockchain keys
    let publicKeys = this.keys.map(pair => pair.public)
    publicKeys = concatNewOwners(publicKeys, assets)
    publicKeys = concatNewOwners(publicKeys, transfers)
    publicKeys.forEach(key => addOption('[name="transferSelect"]', key))
  })
}

app.update = function (action, asset, owner) {
  if (this.user) {
    //ZTB once the device is accepted
    if (count === 1)
    { count = 0 
      submitUpdate(
        { action, asset, owner },
        this.user.private,
        success => success ? app.update('bootstrap', asset) : null
      )
    }
    submitUpdate(
      { action, asset, owner },
      this.user.private,
      success => success ? this.refresh() : null
    )
  }
  
}

// Select User
$('[name="keySelect"]').on('change', function () {
  if (this.value === 'new') {
    app.user = makeKeyPair()
    app.keys.push(app.user)
    saveKeys(app.keys)
    addOption(this, app.user.public, true)
    addOption('[name="transferSelect"]', app.user.public)
  } else if (this.value === 'none') {
    app.user = null
  } else {
    app.user = app.keys.find(key => key.public === this.value)
    app.refresh()
  }
})

// Create Asset
$('#createSubmit').on('click', function () {
  const asset = $('#createName').val()
  if (asset) app.update('create', asset)
})

// Transfer Asset
$('#transferSubmit').on('click', function () {
  //app.transferKeys =makeKeyPair2()//new
  //saveKeys(app.transferKeys)//new
  const asset = $('[name="assetSelect"]').val()
  const owner = $('[name="transferSelect"]').val()
  if (asset && owner) app.update('transfer', asset, owner)
})

// Accept Asset
$('#transferList').on('click', '.accept', function () {
  const asset = $(this).prev().text()
  count = 1 //this will call the ZTB function after updating the state
  if (asset) {app.update('accept', asset);}
})


// Reject Asset
$('#transferList').on('click', '.reject', function () {
  const asset = $(this).prev().prev().text()
  if (asset) {app.update('reject', asset); }
})

// Initialize
app.keys = getKeys()
app.keys.forEach(pair => addOption('[name="keySelect"]', pair.public))
app.refresh()
