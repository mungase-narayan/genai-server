class UserService {
  constructor(userModel) {
    this.userModel = userModel
  }

  async getUserById(userId) {
    return await this.userModel.findById(userId)
  }

  async getUserByEmail(email) {
    return await this.userModel.findOne({ email })
  }

  async createUser(user) {
    return await this.userModel.create(user)
  }

  async updateUser(userId, updatedUser) {
    return await this.userModel.findByIdAndUpdate(userId, updatedUser, {
      new: true,
    })
  }

  async getAllUsers() {
    return await this.userModel.find().sort({ createdAt: -1 })
  }
}

export default UserService
