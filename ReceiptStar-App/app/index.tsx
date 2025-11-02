import { Redirect } from "expo-router";

export default function Index() {
    console.log('--- APP STARTED ---');
    return <Redirect href= "/loadingWelcome" />;
}