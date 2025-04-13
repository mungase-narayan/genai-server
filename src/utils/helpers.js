import fs from 'fs'
import { logger } from '../logger/index.js'

export const filterObjectKeys = (fieldsArray, objectArray) => {
  const filteredArray = structuredClone(objectArray).map((originalObj) => {
    let obj = {}
    structuredClone(fieldsArray)?.forEach((field) => {
      if (field?.trim() in originalObj) {
        obj[field] = originalObj[field]
      }
    })
    if (Object.keys(obj).length > 0) return obj
    return originalObj
  })
  return filteredArray
}

export const getPaginatedPayload = (dataArray, page, limit) => {
  const startPosition = +(page - 1) * limit

  const totalItems = dataArray.length
  const totalPages = Math.ceil(totalItems / limit)

  dataArray = structuredClone(dataArray).slice(
    startPosition,
    startPosition + limit
  )

  const payload = {
    page,
    limit,
    totalPages,
    previousPage: page > 1,
    nextPage: page < totalPages,
    totalItems,
    currentPageItems: dataArray?.length,
    data: dataArray,
  }
  return payload
}

export const getStaticFilePath = (req, fileName) => {
  return `${req.protocol}://${req.get('host')}/images/${fileName}`
}

export const getLocalPath = (fileName) => {
  return `public/images/${fileName}`
}

export const removeLocalFile = (localPath) => {
  fs.unlink(localPath, (err) => {
    if (err) logger.error('Error while removing local files: ', err)
    else {
      logger.info('Removed local: ', localPath)
    }
  })
}

export const removeUnusedMulterImageFilesOnError = (req) => {
  try {
    const multerFile = req.file
    const multerFiles = req.files

    if (multerFile) {
      removeLocalFile(multerFile.path)
    }

    if (multerFiles) {
      const filesValueArray = Object.values(multerFiles)
      filesValueArray.map((fileFields) => {
        fileFields.map((fileObject) => {
          removeLocalFile(fileObject.path)
        })
      })
    }
  } catch (error) {
    logger.error('Error while removing image files: ', error)
  }
}

export const getMongoosePaginationOptions = ({
  page = 1,
  limit = 10,
  customLabels,
}) => {
  return {
    page: Math.max(page, 1),
    limit: Math.max(limit, 1),
    pagination: true,
    customLabels: {
      pagingCounter: 'serialNumberStartFrom',
      ...customLabels,
    },
  }
}

export const getRandomNumber = (max) => {
  return Math.floor(Math.random() * max)
}
