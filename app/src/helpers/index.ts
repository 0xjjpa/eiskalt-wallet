export const abbreviate = (uuid: string, length = 10) => `${uuid.substring(0, length)}...${uuid.substring(uuid.length - length, uuid.length)}`