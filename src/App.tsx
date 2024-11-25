import { Show, createEffect, createSignal, onCleanup } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";
import PlayIcon from "./assets/play.svg?component-solid";
import TimerIcon from "./assets/timer.svg?component-solid";

const secondsInHour = 1000 * 60 * 60;
const formatterOptions: Intl.DateTimeFormatOptions = {
	minute: "2-digit",
	second: "2-digit",
	timeZone: "UTC",
};

const minutesFormatter = new Intl.DateTimeFormat("en-GB", formatterOptions);
const hoursFormatter = new Intl.DateTimeFormat("en-GB", {
	...formatterOptions,
	hour: "2-digit",
});

const formatTime = (time: number) => {
	if (time > secondsInHour) {
		return hoursFormatter.format(time);
	} else {
		return minutesFormatter.format(time);
	}
};

let interval: number;
let reminderTimeout: number;
let requestId!: number;
const root = document.documentElement;
const appWindow = getCurrentWindow();

function App() {
	const [task, setTask] = createSignal<string | null>(null);
	const [timed, setTimed] = createSignal<boolean>(false);
	const [running, setRunning] = createSignal(false);
	const [time, setTime] = createSignal(0);
	let taskRef!: HTMLParagraphElement;

	const handleStart = () => {
		setRunning(true);
		if (!timed()) return;

		interval = setInterval(() => {
			setTime(time() + 1000);
		}, 1000);

		onCleanup(() => {
			clearInterval(interval);
		});
	};

	const stop = () => {
		clearInterval(interval);
		setRunning(false);
		setTime(0);
	};

	const onMouseEnter = () => {
		const zero = performance.now();
		const div = taskRef;
		const shouldScroll = div.scrollWidth - div.clientWidth > 0;

		const scroll = (timestamp: DOMHighResTimeStamp) => {
			const elapsed = timestamp - zero;
			if (elapsed < 200) {
				requestId = requestAnimationFrame(scroll);
				return;
			}

			div.scrollBy({
				behavior: "smooth",
				left: 10,
			});

			requestId = requestAnimationFrame(scroll);
		};

		if (!shouldScroll) {
			return;
		}

		requestId = requestAnimationFrame(scroll);
	};

	const onMouseLeave = () => {
		cancelAnimationFrame(requestId);
		taskRef.scrollTo({
			left: 0,
			top: 0,
			behavior: "smooth",
		});
	};

	const remind = () => {
		clearTimeout(reminderTimeout);
		reminderTimeout = setTimeout(() => {
			root.dataset.shouldRemind = "true";
		}, 1000 * 60 * 15);
	};

	const disableReminder = () => {
		root.dataset.shouldRemind = "false";
		remind();
	};

	createEffect(() => {
		window.addEventListener(
			"mousedown",
			({ buttons, shiftKey, ctrlKey, metaKey, altKey }) => {
				const specialKeyPressed = shiftKey || altKey || ctrlKey || metaKey;

				if (buttons === 1 && specialKeyPressed) {
					appWindow.startDragging(); // Else start dragging
				}
			}
		);

		remind();
	});

	const form = (
		<form
			class="flex gap-1 w-full mx-auto h-full items-center justify-center"
			data-tauri-drag-region
			onSubmit={(e) => {
				e.preventDefault();
				handleStart();
			}}
		>
			<input
				onChange={(e) => setTask(e.currentTarget.value)}
				autocomplete="off"
				placeholder="What needs doing?"
				class="w-full py-2 px-4 grow focus:border-gray-600 invalid:focus:border-red-600"
				required
			/>
			<label class="bg-[#161616] p-2 cursor-pointer shrink-0 h-[2.625rem] w-[2.625rem] flex justify-center items-center hover:border-gray-600 border-2">
				<input
					type="checkbox"
					checked={timed()}
					onChange={(e) => setTimed(e.currentTarget.checked)}
					class="h-0 w-0 p-0 m-0 absolute"
				/>
				<TimerIcon
					class="w-9 transition-colors"
					classList={{
						"stroke-[#4daa57]": timed(),
						"stroke-[#ff1155]": !timed(),
					}}
				/>
			</label>
			<button
				type="submit"
				class="p-2 shrink-0 h-[2.625rem] w-[2.625rem] flex justify-center items-center border-2 hover:border-gray-600"
			>
				<PlayIcon class="w-5" />
			</button>
		</form>
	);

	const timer = (
		<div class="flex justify-between items-center gap-2 data-tauri-drag-region">
			<p
				class="text-lg text-nowrap whitespace-nowrap max-w-full overflow-x-scroll no-scrollbar"
				ref={taskRef}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				{task()}
			</p>
			<button
				class="p-2 px-4 gap-2 shrink-0 flex justify-center items-center text-center hover:border-red-600"
				onClick={stop}
			>
				<Show when={running() && timed()} fallback={"Stop"}>
					<p class="text-lg min-w-[55px]">{formatTime(time())}</p>
				</Show>
				<span>⛔</span>
			</button>
		</div>
	);

	return (
		<main
			class="container h-full w-full p-4 font-display"
			data-tauri-drag-region
			onMouseEnter={disableReminder}
		>
			<Show when={running()} fallback={form}>
				{timer}
			</Show>
		</main>
	);
}

export default App;
