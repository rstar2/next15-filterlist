# DEMO STEPS

## Setup and starting point

- This is a project task manager sort of thing. My designer Eileen Røsholt has designed the UI, and it's based on something we made in our current project.
- The setup is of course Next.js App router, prisma and an Azure DB, tailwind CSS.
- Demo app: Very slow load, slowed down data fetches on purpose.
- But, it's actually not bad. This is all html, navigations and a form for the search, and things work. And there is no JS on the client side. Works without js.
- Try out tabs, try search with a basic form, see the result in the table.
- Good base case, will work even if we are on a device with low processing power that cannot run JS efficiently.
- No data mutation, we are focusing on data fetching and server components patterns, forms and mutations is another story, I've done talks on that before.

## Review lighthouse scores

- Run lighthouse.
- Show impact of each by hovering circle.
- FCP: Bad since we are showing nothing until everything. Check the logs for the true value. Fix mistakenly good scores.
- LCP: Bad, out LCP is shown together with everything else. Check the logs for the true value. Fix mistakenly good scores.
- TBT: 0 since no JS, responsive page, no uncanny valley since default elements.
- CLS: 0 since everything is painted at once.
- Speed index bad since it measures incrementally how much content is shown, but we have nothing until everything is shown.
- Overall metrics terrible and UX is definitely not good.

## Go through the code

- Async components, async layout
- Data fetching server side in a [tab] page.tsx based on the params.
- And we are querying our db based on filters directly in the components and finishing the render there since they are server components. No React state.
- Search is just submitting a query param with a get request
- Tabs are navigating
- App feels terrible because we are waiting for everything to render on the server and only getting the default browser spinner.

## Improve data fetching in layout.tsx

- Show the different data files just querying a db and using cookies() and slow()
- Dynamic requests, static is easy because this could be run in the build, but this is dynamic data. We have to await at runtime.
- I'm blocked by the awaits in the layout and I cant show anything on the screen.
- Layout.tsx fetches are running sequentially even though they don't depend on each other.
- The first thorugh might be to run them in parallel with promise.all().That would help, but you would still be blocked in the layout, and the slowest call which is the page.tsx.
- So, let's unblock the layout and push the data down from the layout to the components themselves, and show Suspense fallbacks.
- Suspense around projectDetails with skeleton, await inside.
- Explain making skeletons the right size. If we don't we get CLS which hurts our score badly. Can be hard.
- Suspense around tabs with skeleton, await inside.
- Unblock the page.tsx by adding suspense around children.
- Suspense Search because SearchParams witch skeleton because SearchParams are dynamic.
- Showcase the result
- Now we can show something on the screen while streaming in the components as they finish. Utilizing the shared compute load between server and client, and interact with what we have (fill search).

Our strategy: We are pushing data fetching down and displaying fallbacks while streaming in the RSC's. All components fetch in parallel in this case since they are independent, reducing total load time. If they did depend on each other, we could have made more levels of suspenses inside each, streaming sequentially. Each component is now responsible for their own data, making them composable.

## Improve UX

The ux is still not good here. We are not getting any feedback when we click things. 

### Mark active tab and read promise with use in Tab.tsx

- Let's begin by seeing the currently active tab. Add useParams and get active tab. Make client component. We cannot have this async now, we have to fetch the data outside. Put the data outside.
- But we don't want to get back to blocking our layout. Lets remove the await and pass it down to the Tabs as a promise.
- Then we can read the promise with use() which will resolve it, and the component will suspend the same way allowing us to see the fallback.
- Now we can see the active tabs.

### Make table flash with startTransition in Tab.tsx

- However when we click the tabs, we dont see anything happening.
- What's happening is we are waiting for the await of the page.tsx to finish, so we cannot switch tabs. We could add a suspense with loading.tsx, but that would be of little value to the user. Let's instead show stale content while waiting. I like to think of it as picking between displaying pending state in the source or destination, the destination would be suspense.
- Add prog-enh to onClick to Tab.tsx, startTransition router.push. Explain useTransition. Mark a state update as non-urgent and non-blocking and get pending state. How can we use this isPending?
- Add data-pending=isPending.
- Show group-has data-pending in page.tsx, show class group.
- Show the result. Pending feedback while showing stale content.
Credit to Sam Selikoff with his post on buildui blog for this pattern.

### Make Tabs.tsx more responsive

- Pay attention to the URL. It's not switching until the new table is done rendering on the server. Therefore we cannot see the active tab right away.
- UseOptimistic is a great tool to handle this. It will take in a state to show no action is pending, and return an trigger function and optimistic value, and it will throw away the client side optimistic state is thrown away after the action completes, then settle to the "truth".
- Add useOptimistic to Tabs.tsx and Tab.tsx. They are now way more responsive.

### Add a loading spinner to Search.tsx

- Progressive enhancement of the base case search with onChange. Enable the spinner. Pay attention to the url - startTransition also batches all state updates, or keystrokes, and executes all of them once they are all done.

We are putting state in the URL. This is a common request because the current state of the app can be shareable and reloadable. But, it can be hard to coordinate state in the url with component state with i.e useEffect - instead the URL is now a single source of truth. We are lifting the state up, which is a well known pattern in React.

## Add CategoryFilter.tsx to layout.tsx

- Add the CategoryFilter component to layout.tsx. It takes in a categories promise and reads it with use. Pass it down with a new data fetch and suspend with a skeleton.
- This component is filtering with searchParams again, using the URL as the state again. However, the filters are not responsive again.
- Add useOptimistic to CategoryFilter.tsx, it also batches them like with the search! Can be cancelled if the user navigates away before the promise resolves.
- Add data-pending. Optimistic UI should be called inside transitions anyway. Show the result.

## Cache() getCategoriesMap in categories.ts

- We are fetching the categories twice for every render - once for the task summary and once for the category filter. Show console logs 2x.
- We can deduplicate this since it's running in the same render.
- Add cache() to getCategoriesMap in categories.ts. Show console logs 1x, reduced load time.
- This is also good for using inside dynamic metadata.

This means that can keep using our common pattern of fetching data inside components, similar to how we would use useQuery in a client side app. This deduplication automatically happening with fetch requests by the way.

## Turn on staleTimes in next.config.js

- Every time we click a tab, filter, or search, we are rerunning the page.tsx table on the server, with the data fetch. We can cache this.
- Cache the rsc payload for the route page.tsx (table) by turning on staleTimes in next.config.js. 
- Show the result. Click the same twice. This is a Next.js 15 feature.

## Final demo

- Reload page. Interact with tabs and filters while streaming in the server components as they load. Switch tabs back and fourth. Click multiple filters.
- Greatly improved UX even though the data fetches are still extremely slow. App feels super responsive.
- And this is very robust: progressively enhanced, we wont have race conditions because of useTransitions, the app is reloadable and shareable. And there is a low amount of js, using it only where needed.
- No useEffects or useStates in sight. We are making interactive apps without it. In the new React world with Next.js 15 we don't need it as much.

## Test lighthouse scores

- FCP: FCP is better! Showing suspense fallbacks right away.
- LCP: Its a lot better, but it's dependant on the project details so it's higher than FCP.
- TBT: 0 since minimal JS and no long tasks, responsive page, no uncanny valley since default elements. Same as before pretty much.
- CLS: Managed 0-0.1 since my skeletons are good, but not perfect and will often be hard to obtain with dynamically sized content.
- Speed index way better since we show incrementally more content.
- Greatly improved scores, 100 lighthouse performance even with a 4s second total load time application.

## Improve LCP (and FCP) with Partial Pre-rendering

- We can still improve. Actually, we are dynamically fetching this project details data on every page load even though it very rarely changes.
- This could be static data that we can revalidate on a time based interval using X (unstable_cache), Y (fetch options) or Z (ISR). Wasting resources and time. Static is the fastest.
- Remove the cookies from the data fetch, and remove the suspense around the projectDetails. Show the result: app is frozen again.
- Turn on partial prerendering in next.config.js. Run build and start and show the result, refresh and new tab. The app is now instantly showing useful content.

## Test lighthouse scores again

- LCP: LCP is our PPR'd project details, so the score is even better. Check ms for LCP in logs.
- This can be very impactful on a bigger application with larger chunks of static content.

## (Do random other things for improvement)

- Turn off slow and feel the UX. Suspense boundaries are omitted cause the app is fast. However we know its okay if it isn't.
- Show filters are being discarded when clicking between them. There is a branch here called filter-provider where I've fixed this and simplified the code by extracting to a optimistic search param provider which React Context which batches all of them together. Check that our if you're interested.
