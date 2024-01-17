const layouts = [
    "random",
    "cose",
    "cose-bilkent",
    "grid",
    "breadthfirst",
    "concentric",
    "circle",
    "fcose"
];

export default function Layout({ setLayout, setScratchMode }) {
    return (
        <div className="absolute z-20 bottom-0 left-0 flex cursor-pointer text-sm text-gray-500 w-full">
            {layouts.map((layout) => (
                <a
                    key={layout}
                    className="p-2 hover:text-gray-800"
                    onClick={(e) => {
                        e.preventDefault();
                        setLayout({ name: layout });
                    }}
                >
                    {layout}
                </a>
            ))}
            <div className="grow"></div>
            <a
                key="clear-context"
                className="p-2 hover:text-gray-800"
                onClick={(e) => {
                    e.preventDefault();
                    setScratchMode(false);
                }}
            >
                all
            </a>
        </div>
    );
}
