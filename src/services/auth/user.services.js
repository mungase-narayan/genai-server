class UserService {
  constructor(userModel) {
    this.userModel = userModel
  }

  getUserById(userId) {
    return this.userModel.findById(userId)
  }

  getUserByEmail(email) {
    return this.userModel.findOne({ email })
  }

  createUser(user) {
    return this.userModel.create(user)
  }

  updateUser(userId, updatedUser) {
    return this.userModel.findByIdAndUpdate(userId, updatedUser, { new: true })
  }
}

export default UserService
