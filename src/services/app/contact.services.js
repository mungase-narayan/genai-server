class ContactService {
  constructor(contactModel) {
    this.contactModel = contactModel
  }

  async create(contact) {
    return await this.contactModel.create(contact)
  }

  async getContacts(filter = {}) {
    return await this.contactModel.find(filter).sort({ createdAt: -1 })
  }
}

export default ContactService
