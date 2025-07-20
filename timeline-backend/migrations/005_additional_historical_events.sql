-- Migration: 005_additional_historical_events.sql
-- Description: Add 40 additional well-known historical events to the timeline game
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Insert 40 additional well-known historical events
INSERT INTO cards (title, date_occurred, category, difficulty, description) VALUES
-- First set of 20 events
('Norman Conquest of England', '1066-10-14', 'History', 3, 'William the Conqueror defeats King Harold at the Battle of Hastings'),
('Magna Carta signed', '1215-06-15', 'History', 3, 'King John of England signs the Magna Carta, establishing the principle of limited government'),
('Christopher Columbus reaches Americas', '1492-10-12', 'History', 2, 'Christopher Columbus makes landfall in the Bahamas, beginning European exploration of the Americas'),
('Protestant Reformation begins', '1517-10-31', 'History', 3, 'Martin Luther posts his 95 Theses on the door of Wittenberg Castle Church'),
('Declaration of Independence signed', '1776-07-04', 'History', 1, 'The United States Declaration of Independence is adopted by the Continental Congress'),
('French Revolution begins', '1789-07-14', 'History', 2, 'The French Revolution begins with the storming of the Bastille prison'),
('Napoleon becomes Emperor', '1804-12-02', 'History', 2, 'Napoleon Bonaparte crowns himself Emperor of France'),
('American Civil War begins', '1861-04-12', 'History', 2, 'The American Civil War begins with the Confederate attack on Fort Sumter'),
('American Civil War ends', '1865-04-09', 'History', 2, 'Confederate General Robert E. Lee surrenders to Union General Ulysses S. Grant'),
('World War I begins', '1914-07-28', 'History', 2, 'World War I begins with Austria-Hungary declaring war on Serbia'),
('World War I ends', '1918-11-11', 'History', 2, 'World War I ends with the signing of the Armistice of Compiègne'),
('Stock Market Crash of 1929', '1929-10-29', 'History', 2, 'The Wall Street Crash of 1929 begins the Great Depression'),
('World War II begins', '1939-09-01', 'History', 1, 'Germany invades Poland, starting World War II'),
('World War II ends', '1945-09-02', 'History', 1, 'Japan formally surrenders aboard the USS Missouri, ending World War II'),
('First Moon Landing', '1969-07-20', 'Space', 2, 'Apollo 11 mission successfully lands Neil Armstrong and Buzz Aldrin on the moon'),
('Berlin Wall falls', '1989-11-09', 'History', 1, 'The Berlin Wall dividing East and West Germany is torn down'),
('Soviet Union dissolves', '1991-12-26', 'History', 2, 'The Soviet Union officially dissolves, ending the Cold War'),
('September 11 attacks', '2001-09-11', 'History', 1, 'Terrorist attacks on the World Trade Center and Pentagon'),
('Global Financial Crisis', '2008-09-15', 'History', 2, 'Lehman Brothers files for bankruptcy, triggering the global financial crisis'),
('COVID-19 pandemic declared', '2020-03-11', 'History', 1, 'WHO declares COVID-19 a global pandemic'),

-- Second set of 20 events
('Fall of Western Roman Empire', '0476-09-04', 'History', 3, 'The last Western Roman Emperor Romulus Augustulus is deposed'),
('Charlemagne crowned Emperor', '0800-12-25', 'History', 3, 'Charlemagne is crowned Holy Roman Emperor by Pope Leo III'),
('First Crusade begins', '1095-11-27', 'History', 3, 'Pope Urban II calls for the First Crusade to recapture Jerusalem'),
('Black Death reaches Europe', '1347-01-01', 'History', 2, 'The Black Death plague arrives in Europe, killing millions'),
('Fall of Constantinople', '1453-05-29', 'History', 3, 'Constantinople falls to the Ottoman Empire, ending the Byzantine Empire'),
('Leonardo da Vinci begins Mona Lisa', '1503-01-01', 'Cultural', 3, 'Leonardo da Vinci begins painting the Mona Lisa'),
('Jamestown founded', '1607-05-14', 'History', 3, 'First permanent English settlement in America is established at Jamestown'),
('Mayflower lands at Plymouth', '1620-12-21', 'History', 3, 'The Mayflower lands at Plymouth Rock, establishing Plymouth Colony'),
('Glorious Revolution', '1688-11-05', 'History', 3, 'William of Orange invades England, beginning the Glorious Revolution'),
('Seven Years War begins', '1756-05-17', 'History', 3, 'The Seven Years War begins between Britain and France'),
('Battle of Waterloo', '1815-06-18', 'History', 2, 'Napoleon is defeated at the Battle of Waterloo by British and Prussian forces'),
('Queen Victoria begins reign', '1837-06-20', 'History', 2, 'Queen Victoria begins her 63-year reign over the British Empire'),
('California Gold Rush begins', '1848-01-24', 'History', 2, 'Gold is discovered at Sutter''s Mill, sparking the California Gold Rush'),
('Emancipation Proclamation', '1863-01-01', 'History', 2, 'President Lincoln issues the Emancipation Proclamation, freeing slaves in Confederate states'),
('Telephone patented', '1876-03-07', 'Technology', 2, 'Alexander Graham Bell patents the telephone'),
('Wright Brothers first flight', '1903-12-17', 'Aviation', 2, 'First powered, sustained, and controlled heavier-than-air human flight'),
('Titanic sinks', '1912-04-15', 'History', 2, 'The RMS Titanic sinks on its maiden voyage after hitting an iceberg'),
('Pearl Harbor attack', '1941-12-07', 'History', 2, 'Japan attacks Pearl Harbor, bringing the United States into World War II'),
('Martin Luther King Jr. "I Have a Dream" speech', '1963-08-28', 'History', 2, 'Martin Luther King Jr. delivers his famous "I Have a Dream" speech'),
('World Wide Web becomes public', '1995-01-01', 'Technology', 2, 'The World Wide Web becomes publicly available, revolutionizing the internet'),

-- Third set of 20 events
('Julius Caesar assassinated', '0044-03-15', 'History', 3, 'Julius Caesar is assassinated by Roman senators on the Ides of March (44 BC)'),
('Edict of Milan', '0313-02-01', 'History', 3, 'Emperor Constantine issues the Edict of Milan, legalizing Christianity in the Roman Empire'),
('Battle of Tours', '0732-10-10', 'History', 3, 'Charles Martel defeats Muslim invasion at the Battle of Tours'),
('Leif Erikson reaches North America', '1000-01-01', 'History', 3, 'Viking explorer Leif Erikson reaches North America, predating Columbus'),
('Genghis Khan unites Mongol tribes', '1206-01-01', 'History', 3, 'Genghis Khan unites the Mongol tribes and begins his conquests'),
('Marco Polo begins journey to China', '1271-01-01', 'History', 3, 'Marco Polo begins his journey to China with his father and uncle'),
('Aztec Empire founded', '1325-01-01', 'History', 3, 'The Aztec Empire is founded with the establishment of Tenochtitlan'),
('Joan of Arc burned at stake', '1431-05-30', 'History', 3, 'Joan of Arc is burned at the stake in Rouen, France'),
('Cortés conquers Aztec Empire', '1521-08-13', 'History', 3, 'Hernán Cortés conquers the Aztec Empire and captures Tenochtitlan'),
('Spanish Armada defeated', '1588-08-08', 'History', 3, 'The Spanish Armada is defeated by the English navy'),
('English Civil War begins', '1642-08-22', 'History', 3, 'The English Civil War begins between Royalists and Parliamentarians'),
('United Kingdom formed', '1707-05-01', 'History', 3, 'England and Scotland unite to form the Kingdom of Great Britain'),
('Stamp Act passed', '1765-03-22', 'History', 3, 'British Parliament passes the Stamp Act, angering American colonists'),
('Louisiana Purchase', '1803-04-30', 'History', 2, 'The United States purchases Louisiana Territory from France'),
('Darwin publishes Origin of Species', '1859-11-24', 'Science', 2, 'Charles Darwin publishes "On the Origin of Species"'),
('Eiffel Tower completed', '1889-03-31', 'Cultural', 1, 'The Eiffel Tower is completed in Paris for the World''s Fair'),
('Women gain right to vote in US', '1920-08-18', 'History', 2, 'The 19th Amendment gives women the right to vote in the United States'),
('Berlin Wall built', '1961-08-13', 'History', 2, 'Construction of the Berlin Wall begins, dividing East and West Berlin'),
('Chernobyl nuclear disaster', '1986-04-26', 'Disaster', 2, 'Nuclear power plant disaster occurs in Chernobyl, Ukraine'),
('India gains independence', '1947-08-15', 'History', 2, 'India gains independence from British rule');

-- Verify the data was inserted correctly
SELECT 
    COUNT(*) as total_cards,
    COUNT(DISTINCT category) as unique_categories,
    MIN(date_occurred) as earliest_date,
    MAX(date_occurred) as latest_date
FROM cards; 