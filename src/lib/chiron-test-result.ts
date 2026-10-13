export interface ChironTestMessage {
  success?: boolean;
  status?: string;
  messageType?: string;
  httpStatus?: number;
  ritnummer?: string;
  error?: string;
  vertrek?: boolean;
  aankomst?: boolean;
  [key: string]: unknown;
}

/** Current API boolean takes precedence; historical reports used a status string. */
export function isAcceptedTestMessage(message: ChironTestMessage): boolean {
  if (typeof message.success === 'boolean') return message.success;
  return message.status === 'success';
}

export function acceptanceReportMessages(messages: ChironTestMessage[]) {
  return messages.map(message => ({ ...message,
    ritnummer: message.ritnummer || 'N/A',
    status: isAcceptedTestMessage(message) ? 'success' as const : 'failed' as const,
    vertrek: message.messageType ? message.messageType === 'vertrek' : message.vertrek === true,
    aankomst: message.messageType ? message.messageType === 'aankomst' : message.aankomst === true,
  }));
}
