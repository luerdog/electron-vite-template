import Store from 'electron-store'

const store = new Store()

export function onBindUser(data) {
  store.set('user_token', data.user_token)

  console.log(store.get('user_token'))
}
