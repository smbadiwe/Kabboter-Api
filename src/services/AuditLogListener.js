export async function onEntityAdded(eventData) {
  if (eventData && eventData.requestData) {
    const auditEntry = {
      eventType: EventType.Create,
      entityName: eventData.entityName,
      entityIds: eventData.id,
      userId: eventData.requestData.user.id,
      username: eventData.requestData.user.username,
      newRecord: { id: eventData.id, ...eventData.record }
    };

    await eventData.knex.insert(auditEntry).into("auditlogs");
  }
}

export async function onEntityListAdded(eventData) {
  if (eventData && eventData.requestData) {
    const auditEntry = {
      eventType: EventType.BatchCreate,
      entityName: eventData.entityName,
      entityIds: eventData.ids,
      userId: eventData.requestData.user.id,
      username: eventData.requestData.user.username
    };

    await eventData.knex.insert(auditEntry).into("auditlogs");
  }
}

async function onEntityModified(eventType, eventData) {
  if (eventData && eventData.requestData) {
    const auditEntry = {
      eventType: eventType,
      entityName: eventData.entityName,
      entityIds: eventData.id,
      userId: eventData.requestData.user.id,
      username: eventData.requestData.user.username,
      oldRecord: eventData.oldRecord,
      newRecord: eventData.newRecord
    };

    await eventData.knex.insert(auditEntry).into("auditlogs");
  }
}

export async function onEntityUpdated(eventData) {
  await onEntityModified(EventType.Update, eventData);
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
