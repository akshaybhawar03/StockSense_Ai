interface Card {
    label: string;
    value: string;
    highlight?: boolean;
    sub?: string;
}

interface Props {
    cards: Card[];
}

export function SummaryCards({ cards }: Props) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div
                    key={card.label}
                    className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border transition-shadow hover:shadow-md ${
                        card.highlight
                            ? 'border-emerald-400 dark:border-emerald-500 ring-1 ring-emerald-400/30'
                            : 'border-gray-100 dark:border-gray-700'
                    }`}
                >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 truncate">{card.label}</p>
                    <p className={`text-lg font-bold break-words leading-tight ${card.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                        {card.value}
                    </p>
                    {card.sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{card.sub}</p>}
                </div>
            ))}
        </div>
    );
}
