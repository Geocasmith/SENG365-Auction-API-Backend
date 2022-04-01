type User = {
    /**
     * User id as defined by the database
     */
    id: number,
    /**
     * Users email as entered when created
     */
    email: string
    /**
     * Users first name as entered when created
     */
    first_name: string
    /**
     * Users last name as entered when created
     */
    last_name: string
    /**
     * Hash of users password as entered when created
     */
    password: string
    /**
     * Users authentication token (created on login)
     */
    auth_token: string
}