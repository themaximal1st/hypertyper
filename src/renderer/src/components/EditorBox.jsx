import { useState } from "react";

export default function EditorBox({ onSubmit }) {
    const [hyperedge, setHyperedge] = useState([]);
    const [input, setInput] = useState("");

    function handleKeyDown(event) {
        if (event.key === "Backspace" || event.key === "Escape") {
            if (input === "") {
                setHyperedge(hyperedge.slice(0, -1));
            }
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (input === "") {
            setHyperedge([]);
            setInput("");
            return;
        } else {
            const current = [...hyperedge, input];
            setHyperedge(current);
            setInput("");
            await onSubmit(current); // replace
        }
    }

    return (
        <div className="absolute inset-0 pointer-events-none z-20">
            <div className="flex justify-center items-start gap-4 mt-4">
                {hyperedge.map((item, i) => (
                    <div
                        key={`${item}-${i}`}
                        className="bg-white border-r p-2 rounded-lg pointer-events-auto opacity-100"
                    >
                        {item}
                    </div>
                ))}
                <div className="rounded-lg opacity-100">
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                                setInput(e.target.value);
                            }}
                            placeholder="Create"
                            className="p-2 border-0 rounded-lg pointer-events-auto outline-none"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}
