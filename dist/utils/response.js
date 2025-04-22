"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a standardized API response
 * @param statusCode - HTTP status code
 * @param message - Response message
 * @param data - Response data
 * @returns API response object
 */
function createApiResponse(statusCode, message, data = null) {
    const response = {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE'
        },
        body: JSON.stringify({
            status: statusCode < 400 ? 'success' : 'error',
            message,
            data
        })
    };
    return response;
}
exports.default = createApiResponse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi91dGlscy9yZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOzs7Ozs7R0FNRztBQUNILFNBQVMsaUJBQWlCLENBQ3hCLFVBQWtCLEVBQ2xCLE9BQWUsRUFDZixPQUFZLElBQUk7SUFFaEIsTUFBTSxRQUFRLEdBQWdCO1FBQzVCLFVBQVU7UUFDVixPQUFPLEVBQUU7WUFDUCxjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLDZCQUE2QixFQUFFLEdBQUc7WUFDbEMsOEJBQThCLEVBQUUsNEJBQTRCO1lBQzVELDhCQUE4QixFQUFFLDZCQUE2QjtTQUM5RDtRQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ25CLE1BQU0sRUFBRSxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU87WUFDOUMsT0FBTztZQUNQLElBQUk7U0FDTCxDQUFDO0tBQ0gsQ0FBQztJQUNGLE9BQU8sUUFBUSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxrQkFBZSxpQkFBaUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwaVJlc3BvbnNlIH0gZnJvbSAnLi4vdHlwZXMnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFuZGFyZGl6ZWQgQVBJIHJlc3BvbnNlXG4gKiBAcGFyYW0gc3RhdHVzQ29kZSAtIEhUVFAgc3RhdHVzIGNvZGVcbiAqIEBwYXJhbSBtZXNzYWdlIC0gUmVzcG9uc2UgbWVzc2FnZVxuICogQHBhcmFtIGRhdGEgLSBSZXNwb25zZSBkYXRhXG4gKiBAcmV0dXJucyBBUEkgcmVzcG9uc2Ugb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUFwaVJlc3BvbnNlKFxuICBzdGF0dXNDb2RlOiBudW1iZXIsIFxuICBtZXNzYWdlOiBzdHJpbmcsIFxuICBkYXRhOiBhbnkgPSBudWxsXG4pOiBBcGlSZXNwb25zZSB7XG4gIGNvbnN0IHJlc3BvbnNlOiBBcGlSZXNwb25zZSA9IHtcbiAgICBzdGF0dXNDb2RlLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLEF1dGhvcml6YXRpb24nLFxuICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnT1BUSU9OUyxQT1NULEdFVCxQVVQsREVMRVRFJ1xuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgc3RhdHVzOiBzdGF0dXNDb2RlIDwgNDAwID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBkYXRhXG4gICAgfSlcbiAgfTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVBcGlSZXNwb25zZTsgIl19