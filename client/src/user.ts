import { v4 as uuidv4 } from 'uuid'; 

export const getUserId = () => {

    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = uuidv4()
        localStorage.setItem('userId', userId);
    }
    return userId;
}

export const getUserName = () => {

    const userName = localStorage.getItem('userName');
    return userName ?? "";
}

