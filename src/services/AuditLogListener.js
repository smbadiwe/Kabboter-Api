export async function onEntityAdded(eventData) {
  if (eventData && eventData.requestData) {
    const auditEntry = {
      eventType: EventType.Create,
      newRecord: { id: eventData.id, ...eventData.record }
    };
    setExtraAuditEntryFields(auditEntry, eventData);
    await eventData.knex.insert(auditEntry).into("auditlogs");
  }
}

export async function onEntityListAdded(eventData) {
  if (eventData && eventData.requestData) {
    const auditEntry = {
      eventType: EventType.BatchCreate
    };
    setExtraAuditEntryFields(auditEntry, eventData);
    await eventData.knex.insert(auditEntry).into("auditlogs");
  }
}

async function onEntityModified(eventType, eventData) {
  if (eventData && eventData.requestData) {
    const auditEntry = {
      eventType: eventType,
      oldRecord: eventData.oldRecord,
      newRecord: eventData.newRecord
    };

    setExtraAuditEntryFields(auditEntry, eventData);
    await eventData.knex.insert(auditEntry).into("auditlogs");
  }
}

function setExtraAuditEntryFields(auditEntry, eventData) {
  auditEntry.entityName = eventData.entityName;
  auditEntry.entityIds = eventData.ids;
  auditEntry.userId = eventData.requestData.user.id;
  auditEntry.username = eventData.requestData.user.username;
  auditEntry.requestType = eventData.requestData.method;
  auditEntry.requestUrl = eventData.requestData.url;
  auditEntry.requestBody = eventData.requestData.body || eventData.requestData.query;
}

export async function onEntityUpdated(eventData) {
  await onEntityModified(EventType.Update, eventData);
}

export async function onEntityDeleted(eventData) {
  await onEntityModified(EventType.Delete, eventData);
}

export async function onEntityEnabled(eventData) {
  await onEntityModified(EventType.Enable, eventData);
}

export async function onEntityDisabled(eventData) {
  await onEntityModified(EventType.Disable, eventData);
}

export async function onEntityPublished(eventData) {
  await onEntityModified(EventType.Publish, eventData);
}

export async function onEntityUnpublished(eventData) {
  await onEntityModified(EventType.Unpublish, eventData);
}

export const EventType = {
  Create: 1,
  BatchCreate: 2,
  Update: 3,
  Enable: 4,
  Disable: 5,
  Publish: 6,
  Unpublish: 7,
  Delete: 8,
  FailedLogin: 9,
  SuccessfulLogin: 10
};
