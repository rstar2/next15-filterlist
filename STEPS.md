# DEMO STEPS

## Setup and starting point

- This is a project task manager sort of thing. The designer of my current project Eileen Røsholt has designed the UI, and it's based on something I made there.
- The setup is of course Next.js App router, prisma and an Azure DB cause its free on my company azure account, tailwind CSS.
- Demo app: Very slow load, slowed down data fetches on purpose.
- But, it's actually not bad. This is all server components, which means there is no js shipped to the client for these components. Just html, navigations and a form for the search, and things work. Works without js.
- Try out tabs, try search with a basic form, see the result in the table.
- Good base case, will work even if we are on a device with low processing power that cannot run JS efficiently.
- No data mutation, we are focusing on data fetching and server components patterns, forms and mutations is another story, I've done talks on that before.

## Review lighthouse scores

- Open pre-run lighthouse screen. Show impact of each by hovering circle.
- FCP: Bad since we are showing nothing until everything.
- LCP: Bad, out LCP is shown together with everything else.
- TBT: 0 since no JS, responsive page, no uncanny valley since default elements. INP is 0 since no js.
- CLS: 0 since everything is painted at once.
- Speed index bad since it measures incrementally how much content is shown, but we have nothing until everything is shown.
- Overall metrics are bad but actually not the worst because we have no js to worsen TBT and no moving elements to worsen CLS.
- However the app feels terrible on initial load because we are waiting for everything to render on the server and only getting the default browser spinner.

## Go through the code

- Async layout.tsx server component
- Show the different data files just querying a db and using cookies() and slow()
- Search is just submitting a query param with a get request using a form.
- Async [tab] page.tsx server components, we are querying our db based on filters directly based on the filters inside this server component.
- Meaning we are never doing any of this stuff on the client, and the components are only generated on the server.
- Dynamic requests, static is easy because this could be run in the build, but this is dynamic data. We have to await at runtime.
- Basically, want we want to do is elevate the speed, interactivity and UX of this app, and improve the web vitals that are bad without worsening the good ones.

## Improve the UX when switching tabs

- Lets improve the UX of these tabs.
- Tabs are navigating but very slowly, because we are waiting for the await for the table data in page.tsx to finish.
- Suspense will allow us to mark something as lower priority and non-blocking, and show a fallback while waiting for finish, and then stream it in.
- Let's unblock the page.tsx by adding loading.tsx inside /[tab] to create an implicit suspense boundary. Now it can navigate instantly.

## Improve data fetching in layout.tsx

- For the initial load, I'm blocked by the awaits in the layout and I cant show anything on the screen.
- Layout.tsx fetches are running sequentially even though they don't depend on each other.
- The first through might be to run them in parallel with promise.all().That would help, but you would still be blocked in the layout.
- So, let's push the data fetches down from the layout to the components themselves, and show Suspense fallbacks.
- Move projectDetails fetch to projectDetails.tsx, and move tabs fetch to tabs.tsx.
- Suspense "loading..." around projectDetails with skeleton, and around tabs with tabs.tsx. Show the result.
- We fixed the FCP and LCP since we are showing content after just 0.5s and not blocking the page. However, did you see how the elements are visually unstable as they load. Open CWV plugin, we got layout shift. CLS is very impactful on our scores.
- We have to make skeletons the right size, which can be hard. Replace with skeletons.
- Suspense Search because SearchParams witch skeleton because SearchParams opt into dynamic rendering.
- Showcase the result and the score again.

By are pushing data fetching down and displaying fallbacks while streaming in the generated RSC's using minimal js, and utilizing the shared compute load between server and client, we can actually show something on the screen and even interact with what we have (fill search).  All components fetch in parallel in this case since they are independent, reducing total load time. If they did depend on each other, we could have made more levels of suspenses inside each, streaming sequentially. Each component is now responsible for their own data, making them composable. If we turn off the slow the suspense boundaries would be mostly omitted.

## Improve UX

The ux is still not good here. We are not seeing active tab and the search is doing a full page reload.

### Mark active tab and read promise with use in Tabs.tsx

- Let's continue by seeing the currently active tab. Add useParams and get active tab. Make client component. We cannot have this async now, we have to fetch the data outside. Put the data outside.
- But we don't want to get back to blocking our layout. Lets remove the await and pass it down to the Tabs as a promise.
- Then we can read the promise with use() which will resolve it, and the component will suspend the same way allowing us to see the fallback.
- Now we can see the active tabs and navigate between them.

### Add a loading spinner to Search.tsx

- Progressive enhancement of the base case search with onChange, add router and searchParams. Add "use client". Using the existing search params because I will be adding more in the next step.
- Add key to form to reset it between tabs
- Notice the url is updating later because we are waiting for the await in the table to resolve before routing.
- Explain useTransition: mark a state update as non-urgent and non-blocking and get pending state.
- Use pending state to display user while waiting for the navigation to finish, which is the await in the table component.
- Enable the spinner, while we are transitioning, we can see it. When this is hydrated by js, we have the onchange and the spinner.
- (Using a transition also batches the key strokes, leaving only one entry in the history.)

We are putting state in the URL. This is a common request because the current state of the app can be shareable and reloadable. But, it can be hard to coordinate state in the url with component state with i.e useEffect - instead the URL is now a single source of truth, by lifting the state up, which is a well known pattern in React.

## Add CategoryFilter.tsx to layout.tsx

- Add the CategoryFilter component to layout.tsx. It takes in a categories promise and reads it with use. Pass it down with a new data fetch and suspend with a disabled toggle button.
- This component is filtering with searchParams again, using the URL as the state again. However when we click the tabs, we don't see anything happening.
- Pay attention to the URL. It's not switching until the new table in page.tsx is done with its await query and finished rendering on the server. Therefore we cannot see the active filters right away.
- What's happening is we are waiting for the await of the page.tsx.
- Add startTransition router.push. How can we use this isPending?
- Add data-pending=isPending attribute. Instead of creating a global state manager, we can just use css.
- Show group-has data-pending in page.tsx, show class group.
- Show the result. Pending feedback while showing stale content instead of nothing.
- But i also want responsive buttons, and were gonna use useOptimistic - it is a great tool to handle this. It will take in a state to show no action is pending, and return an trigger function and optimistic value.
- Add useOptimistic to CategoryFilter.tsx.
- UseOptimistic will throw away the client side optimistic state after the navigation completes, then settle to the "truth" which is the URL.
- Credit to Sam Selikoff with his post on buildui blog for this pattern.
- (Batchign again, only updating once we are done selecting, leaving only one entry in the history.)

The categories are instant and don't depend in the network. Refreshing the page will show the correct state.

## Cache() getCategoriesMap in categories.ts

- We are fetching the categories twice for every render - once for the task summary and once for the category filter. (Show console logs 2x.)
- We can deduplicate this since it's running in the same render.
- Add cache() higher order React 19 function to getCategoriesMap in categories.ts. Now it's only run once. (Show console logs 1x.)
- The load time is actually reduced by 500ms because the getTaskSummary is reusing the prepared data from the getCategoriesMap called by categoryFilter.

This means that can keep using our common pattern of fetching data inside components, similar to how we would use useQuery in a client side app.

## Turn on staleTimes in next.config.js

- Every time we click a tab, filter, or search, we are rerunning the page.tsx table on the server, with the data fetch. We can cache this.
- Cache the rsc payload for the route page.tsx (table) by turning on staleTimes in next.config.js. This is a Next.js 15 feature.
- Show the result. Click the same twice.

## Final demo

- Interact with tabs and filters while streaming in the server components as they load.
- Greatly improved UX. Even though the data fetches are still extremely slow, the app feels super responsive.
- Search, refresh the page and have the same state.
- And this is very robust: progressively enhanced, we wont have race conditions because of useTransitions. And there is a low amount of js, using it only where needed, the buttons work with onclick while we are streaming in the server components.
- No useEffects or useStates in sight. We are making interactive apps without them in this new world of React and Next.js.

## Open CWV plugin: the state of our scores

- We already had these FCP and LCP from the prevoius steps.
- FCP is way better since we are seeing content right away after 0.5s.
- LCP is our project details and its very fast, 0.5s.
- CLS: Managed 0-0.1 since my skeletons are good, but not perfect and will often be hard to obtain with dynamically sized content.
- INP: very good since minimal JS and no long tasks, responsive page, no uncanny valley since default elements. Same as before pretty much.

## Improve FCP with Partial Pre-rendering

- We can still improve. Actually, we are dynamically fetching this project details data on every page load even though it very rarely changes.
- This could be static data that we can revalidate on a time based interval using X (unstable_cache), Y (fetch options) or Z (ISR). Wasting resources and time. Static is the fastest.
- Turn on partial prerendering in next.config.js. This will allow me to partially render a page or layout as static, also in Next.js 15. Very powerful.
- Remove the cookies from the data fetch, and remove the suspense around the projectDetails. Show the result: app is frozen again.

## Review lighthouse scores again

- Open the second tab in new window with pre-run scores.
- The LCP is our project info and is now greatly reduced because it is static.
- Speed index way better since we show incrementally more content as seen in filmstrip.
- Reload, copy paste new tab: the app is now instantly showing useful content. This can be extremely impactful on a bigger application with larger or slower chunks of static content.
- We managed to complete our task of improving the bad metrics and maintaining the good metrics, while also making app fast, interactive and user-friendly.
- Greatly improved scores, 100 lighthouse performance even with a 2s second total load time application.
