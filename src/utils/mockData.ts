// This file now only contains the data structure definitions (interfaces)
// that the frontend expects from your API.

export interface GemsTransaction {
  TRANSACTION_ID: string;
  GE_NUMBER: string;
  EVENT_ID: string;
  EVENT_NAME: string;
  FILE_ID: string;
  PDF_FILE_NAME: string;
  JSONSENTDATE: string;
}

export interface GpfTransaction {
  TRANSACTION_ID: string;
  GPF_ID:string;
  KGID: string;
  NAME: string;
  DATE_OF_BIRTH: string;
  JOINING_DATE: string;
  POLICY_NO: string;
  POLICY_START_DATE: string;
  JSON_SENT_DATE: string;
}
