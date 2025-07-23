class TemplateService {
  constructor(templateModel) {
    this.templateModel = templateModel
  }

  async get(templateId) {
    return await this.templateModel.findById(templateId)
  }

  async update(templateId, template) {
    return await this.templateModel.findByIdAndUpdate(
      templateId,
      { $set: template },
      { new: true }
    )
  }

  async delete(templateId) {
    return await this.templateModel.findByIdAndDelete(templateId)
  }

  async create(template) {
    return await this.templateModel.create(template)
  }

  async getTemplates(filter = {}) {
    return await this.templateModel.find(filter)
  }
}

export default TemplateService
