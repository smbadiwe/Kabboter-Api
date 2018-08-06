export async function onLogin(eventData) {
  if (eventData) {
    const auditEntry = {
      eventType: EventType.SuccessfulLogin
    };
    await commit(auditEntry, eventData);
  }
}

export async function onFailedLogin(eventData) {
  if (eventData) {
    const auditEntry = {
      eventType: EventType.FailedLogin,
      newRecord: JSON.stringify(eventData.requestData.body) // 'newRecord' will store the request data that failed
    };
    await commit(auditEntry, eventData);
  }
}

export async function onEntityAdded(eventData) {
  if (eventData) {
    const rec = eventData.record;
    rec.id = eventData.ids;
    const auditEntry = {
      eventType: EventType.Create,
      newRecord: JSON.stringify(rec)
    };
    await commit(auditEntry, eventData);
  }
}

export async function onEntityListAdded(eventData) {
  if (eventData) {
    const auditEntry = {
      eventType: EventType.BatchCreate
    };
    await commit(auditEntry, eventData);
  }
}

export async function onEntityModified(eventType, eventData) {
  if (eventData) {
    const auditEntry = {
      eventType: eventType,
      oldRecord: JSON.stringify(eventData.oldRecord),
      newRecord: JSON.stringify(eventData.newRecord)
    };

    await commit(auditEntry, eventData);
  }
}

async function commit(auditEntry, eventData) {
  setExtraAuditEntryFields(auditEntry, eventData);
  await eventData.knex.table("auditlogs").insert(auditEntry);
}

function setExtraAuditEntryFields(auditEntry, eventData) {
  auditEntry.entityName = eventData.entityName;
  if (eventData.ids) {
    auditEntry.entityIds = JSON.stringify(eventData.ids);
  }
  //  eventData.requestData [Optional] the request; will usually be ctx.request
  if (eventData.requestData) {
    auditEntry.requestType = eventData.requestData.method;
    auditEntry.requestUrl = eventData.requestData.url;
    auditEntry.requestBody = JSON.stringify(
      eventData.requestData.body || eventData.requestData.query
    );
    if (eventData.requestData.user) {
      auditEntry.userId = eventData.requestData.user.id;
      auditEntry.username = eventData.requestData.user.username;
    }
  }
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
