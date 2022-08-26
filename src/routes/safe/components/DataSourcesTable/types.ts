export type Parameter = {
  displayName: string
  key: string
  type: string
  placeholder: string
  defaultValue: string
  helpText: string
  ionIcon?: any
}

export type ConnectInstructions = {
  url: string
  parameters: Parameter[]
  usePopup: boolean
}

export type Button = {
  accessibilityText: string
  action: string
  additionalInformation?: any
  badgeText?: any
  backgroundColor?: any
  color: string
  confirmationText?: any
  fontAwesome: string
  functionName: string
  html: string
  icon: string
  id: string
  image: string
  ionIcon: string
  link: string
  onClick?: any
  parameters: any[]
  stateName: string
  stateParams: any
  subtitle?: any
  successAlertBody?: any
  successAlertTitle?: any
  successToastText?: any
  target?: any
  text: string
  textColor?: any
  title: string
  tooltip: string
  type?: any
  userId?: any
  visible?: any
  webhookUrl?: any
  slug?: any
  menus: any[]
}

export type DataSource = {
  affiliate: boolean
  backgroundColor: string
  clientRequiresSecret: boolean
  displayName: string
  enabled: any
  getItUrl: string
  id: number
  image: string
  logoColor: string
  longDescription: string
  name: string
  shortDescription: string
  synonyms: string[]
  availableOutsideUS: boolean
  maximumRequestTimeSpanInSeconds: number
  variableNames: string[]
  defaultVariableCategoryName: string
  mobileConnectMethod: string
  connectError: string
  connectInstructions: ConnectInstructions
  connectorUserEmail?: any
  connectStatus: string
  errorMessage: string
  fontAwesome: string
  importViaApi: boolean
  lastSuccessfulUpdatedAt: string
  logoutUrl: string
  message: string
  minimumAllowedSecondsBetweenMeasurements: number
  newMeasurements?: any
  providesUserProfileForLogin?: boolean
  qmClient?: boolean
  spreadsheetUpload?: boolean
  totalMeasurementsInLastUpdate?: number
  updateError: string
  updateRequestedAt: any
  updateStatus: string
  platforms: string[]
  buttons: Button[]
  card?: any
  connected: boolean
  count?: any
  createdAt: string
  dataSourceType: string
  defaultUnitAbbreviatedName: string
  imageHtml: string
  instructionsHtml?: any
  linkedDisplayNameHtml: string
  numberOfConnections?: any
  numberOfDataSourceImports?: any
  numberOfDataSourceRequests?: any
  numberOfMeasurements?: number
  oauth: boolean
  premium?: boolean
  updatedAt?: any
  userId?: number
  wpPostId?: any
  connectorClientId: string
  scopes: string[]
  stdOAuthToken?: any
  repositoryImages?: any
  oauthServiceName: string
  crappy?: boolean
  variableCategoryName: string
  mergeOverlappingMeasurements?: boolean
  spreadsheetUploadLink: string
}

export type DataSourceResponse = {
  connectors: DataSource[]
  success: boolean
  status: string
  code: number
  description: string
  summary: string
  errors: any[]
  sessionTokenObject?: any
  avatar?: any
  warnings: any[]
  data?: any
}

export type SafeDataSourcesResponse = DataSource[]
