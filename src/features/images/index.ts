// Images feature exports
export {
  articleImageApi,
  caseImageApi,
  serviceImageApi,
  employeeImageApi,
  reviewImageApi,
  userImageApi,
  meImageApi,
  tenantImageApi,
  imageKeys,
  validateImageFile,
  SUPPORTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  type ImageValidationResult,
} from "./api/imagesApi";

export {
  useUploadArticleCoverImage,
  useDeleteArticleCoverImage,
  useUploadCaseCoverImage,
  useDeleteCaseCoverImage,
  useUploadServiceImage,
  useDeleteServiceImage,
  useUploadEmployeePhoto,
  useDeleteEmployeePhoto,
  useUploadReviewAuthorPhoto,
  useDeleteReviewAuthorPhoto,
  useUploadUserAvatar,
  useDeleteUserAvatar,
  useUploadMyAvatar,
  useDeleteMyAvatar,
  useUploadTenantLogo,
  useDeleteTenantLogo,
} from "./model/useImageUpload";

