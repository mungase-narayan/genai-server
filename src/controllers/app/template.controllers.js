import MSG from '../../constants/msg.js'
import { ApiResponse } from '../../utils/index.js'

class TemplateController {
  constructor(templateService, logger) {
    this.templateService = templateService
    this.logger = logger
  }

  async create(req, res) {
    const userId = req.user._id
    const template = req.body
    this.logger.info({
      msg: MSG.APP.TEMPLATE.CREATE_TEMPLATE,
      data: { template },
    })

    const createdTemplate = await this.templateService.create({
      ...template,
      userId,
    })

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdTemplate, 'Template created successfully')
      )
  }

  async update(req, res) {
    const { templateId, ...template } = req.body

    this.logger.info({
      msg: MSG.APP.TEMPLATE.UPDATE_TEMPLATE,
      data: { templateId, template },
    })

    const updatedTemplate = await this.templateService.update(
      templateId,
      template
    )

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedTemplate, 'Template updated successfully')
      )
  }

  async delete(req, res) {}

  async get(req, res) {
    const { templateId } = req.query
    this.logger.info({
      msg: MSG.APP.TEMPLATE.GET_TEMPLATE,
      data: { templateId },
    })
    const template = await this.templateService.get(templateId)
    return res
      .status(200)
      .json(new ApiResponse(200, template, 'Template fetched successfully'))
  }
}

export default TemplateController
