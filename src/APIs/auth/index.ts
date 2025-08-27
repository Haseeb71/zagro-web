import API from '../../APIs/base'
import { ENDPOINT } from '../../config/constants'
const login = async (email: string, password: string) => {
    return await API.postMethod(ENDPOINT.auth.login, false, {
        email,
        password,
    } as any)
}

const getPermissions = async () => {
    return await API.getMethod(ENDPOINT.permissions.getPermissions, true, false);
}

const getRoles = async () => {
    return await API.getMethod(ENDPOINT.permissions.getRoles, true, false);
}

const addRole = async (data: any) => {
    return await API.postMethod(ENDPOINT.permissions.addRole, true, data)
}

const deleteRole = async (data: any) => {
    return await API.postMethod(ENDPOINT.permissions.deleteRole, true, data)
}

const updateRole = async (data: any) => {
    return await API.postMethod(ENDPOINT.permissions.updateRole, true, data)
}

/**
 * Workers
 */
const addWorker = async (data: any) => {
    return await API.postMethod(ENDPOINT.permissions.addWorker, true, data);
}

const getAllWorker = async () => {
    return await API.getMethod(ENDPOINT.permissions.getAllWorkers, true, false);
}

const editWorker = async (data: any) => {
    return await API.postMethod(ENDPOINT.permissions.editWorker, true, data);
}

const deleteWorker = async (data: any) => {
    return await API.postMethod(ENDPOINT.permissions.deleteWorker, true, data);
}

export default {
    login,
    getPermissions,
    getRoles,
    addRole,
    deleteRole,
    updateRole,
    addWorker,
    getAllWorker,
    editWorker,
    deleteWorker
}