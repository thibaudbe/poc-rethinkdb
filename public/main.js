window.addEventListener('load', (e) => {
  const socket = io()
  const h = React.createElement

  class App extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        users: [],
        name: '',
        email: '',
        editedUser: {},
      }
      this.userElt = this.userElt.bind(this)
    }
    componentDidMount() {
      socket.on('/getUsers', (users) => this.setState({ users }))
      socket.on('/updateUsersAfterPost', (newUser) => {
        this.setState({ users: this.state.users.concat(newUser) })
      })
      socket.on('/updateUsersAfterDelete', (oldUser) => {
        this.setState({ users: this.state.users.filter(u => u.id !== oldUser.id) })
      })
      socket.on('/updateUsersAfterEdit', (newUser) => {
        this.setState({ users: this.state.users.map(u => u.id === newUser.id ? newUser : u) })
      })
    }
    render() {
      const { name, email, users } = this.state
      const usersElt = users.map(this.userElt)
      return React.createElement('div', null,
        h('form', { onSubmit: (e) => this.onSubmitUserForm(e) },
          h('label', { htmlFor: 'name' }, 'name'),
          h('input', { id: 'name', type: 'text', value: name, onChange: (e) => this.onInputChange(e) }),
          h('label', { htmlFor: 'email' }, 'email'),
          h('input', { id: 'email', type: 'email', value: email, onChange: (e) => this.onInputChange(e) }),
          h('button', { type: 'submit' }, 'Create'),
        ),
        h('fieldset', null,
          h('legend', null, 'Users'),
          h('div', null, usersElt),
        ),
      )
    }
    onInputChange(e) {
      const { id, value } = e.target
      this.setState({ [id]: value })
    }
    onSubmitUserForm(e) {
      e.preventDefault()
      const { name, email, users } = this.state
      socket.emit('/postUser', { name, email })
      this.setState({ name: '', email: '' })
    }
    editBlockElt(user) {
      const { editedUser } = this.state

      const onEditUser = (e) => {
        const { value } = e.target
        const newUser = Object.assign(user, { email: value })
        this.setState({ editedUser: newUser })
      }
      const isEditing = user.id === editedUser.id
      return isEditing
        ? (
          h('span', null,
            h('input', { type: 'email', value: user.email, onChange: (e) => onEditUser(e) }),
            this.editBtn(user),
            this.cancelBtn(),
          )
        )
        : h('span')
    }
    deleteBtn(user) {
      return h('button', {
        onClick: () => socket.emit('/deleteUser', user.id)
      }, 'delete')
    }
    editBtn(user) {
      return h('button', {
        onClick: () => socket.emit('/editUser', user)
      }, 'edit')
    }
    cancelBtn() {
      return h('button', { onClick: (e) => this.setState({ editedUser: {} }) }, 'cancel')
    }
    userElt(user) {
      const { editedUser } = this.state
      const isEditing = user.id === editedUser.id
      return h('div', {
        key: user.id,
        onDoubleClick: () => this.setState({ editedUser: user })
      },
        h('b', null, user.name + ': '),
        isEditing ? undefined : h('span', null, user.email),
        isEditing ? undefined : this.deleteBtn(user),
        this.editBlockElt(user),
      )
    }
  }
  ReactDOM.render(
    h(App),
    document.getElementById('app')
  )
})