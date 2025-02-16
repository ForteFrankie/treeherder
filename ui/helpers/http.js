import Cookies from 'js-cookie';

import { processErrorMessage } from './errorMessage';

const generateHeaders = function generateHeaders() {
  return new Headers({
    'X-CSRFToken': Cookies.get('csrftoken'),
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });
};

export const getData = async function getData(url, options = {}) {
  let failureStatus = null;
  const response = await fetch(url, options);

  if (!response.ok) {
    failureStatus = response.status;
  }

  const contentType =
    response.headers.get('content-type') || ''.startsWith('text/html');

  if (contentType && contentType !== 'application/json' && failureStatus) {
    const errorMessage = processErrorMessage(
      `${failureStatus}: ${response.statusText}`,
      failureStatus,
    );
    return { data: errorMessage, failureStatus };
  }

  let data = await response.json();

  if (failureStatus) {
    data = processErrorMessage(data, failureStatus);
  }
  return { data, failureStatus };
};

export const create = function postJson(uri, data) {
  return getData(uri, {
    method: 'POST',
    headers: generateHeaders(),
    body: JSON.stringify(data),
  });
};

export const update = function putJson(uri, data) {
  return getData(uri, {
    method: 'PUT',
    headers: generateHeaders(),
    body: JSON.stringify(data),
  });
};

export const destroy = function deleteRecord(uri) {
  return getData(uri, {
    method: 'DELETE',
    headers: generateHeaders(),
  });
};

export const destroyMany = function deleteRecords(uri, data) {
  return getData(uri, {
    method: 'DELETE',
    headers: generateHeaders(),
    body: JSON.stringify(data),
  });
};

export const processResponse = (response, state, errorMessages) => {
  const { data, failureStatus } = response;
  if (failureStatus) {
    return { errorMessages: [...errorMessages, ...[data]] };
  }
  return { [state]: data };
};

export const processErrors = (responses) => {
  const errorMessages = [];
  responses.forEach((response) => {
    if (response.failureStatus) {
      errorMessages.push(response.data);
    }
  });
  return errorMessages;
};
