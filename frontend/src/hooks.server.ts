import { fetchApi } from '$lib/utils/fetch';
import type { Handle } from '@sveltejs/kit';
import { AxiosError } from 'axios';
import Cookies from 'js-cookie';

export const handle: Handle = async ({ event, resolve }) => {
	try {
		const token = event.cookies.get('token');

		if (token) {
			const response = await fetchApi('/user', 'GET', {}, {
				'x-token': token
			});

			if (response.status === 200) {
				event.locals.user = response.result || {};
			}
		} else {
			event.locals.user = {};
		}

	} catch (error) {
		// Cookies.remove('token');
		if (error instanceof AxiosError) {
			console.log(error.response?.data)
		}
	}

	const response = await resolve(event);
	return response;
};